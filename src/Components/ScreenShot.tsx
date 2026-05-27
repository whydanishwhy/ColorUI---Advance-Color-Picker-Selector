import React, { useCallback, useEffect, useRef, useState } from "react";
import { Download, ChevronUp, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";
import Tippy from '@tippyjs/react';
type Format      = "PNG" | "JPG" | "PDF";
import { baseColor } from "../UI-Models/Constant";
type CaptureMode = "visible" | "fullpage" | "selection";
type Status      = "idle" | "selecting" | "capturing" | "success" | "error";
interface SelectionRect { startX: number; startY: number; endX: number; endY: number; }

// ─── Messaging ────────────────────────────────────────────────────────────────

function sendToBackground<T>(message: object): Promise<T> {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
        if (!response)               return reject(new Error("No response from background"));
        if ((response as any).error) return reject(new Error((response as any).error));
        resolve(response as T);
      });
    } catch (err) { reject(err); }
  });
}

// ─── Host hide/show ───────────────────────────────────────────────────────────

function hideHost() {
  const h = document.getElementById("__EXT_HOST__");
  if (!h) return;
  h.style.visibility   = "hidden";
  h.style.opacity      = "0";
  h.style.pointerEvents = "none";
}
function showHost() {
  const h = document.getElementById("__EXT_HOST__");
  if (!h) return;
  h.style.visibility   = "visible";
  h.style.opacity      = "1";
  h.style.pointerEvents = "auto";
}

// ─── Page dimensions (accurate) ───────────────────────────────────────────────

function getPageDimensions() {
  // Use the maximum of all height sources — different pages report differently
  const totalHeight = Math.max(
    document.body.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.scrollHeight,
    document.documentElement.offsetHeight,
    document.documentElement.clientHeight,
  );
  return {
    totalHeight,
    viewportHeight:  window.innerHeight,
    viewportWidth:   window.innerWidth,
    devicePixelRatio: window.devicePixelRatio || 1,
    estimatedStrips: Math.ceil(totalHeight / window.innerHeight),
  };
}

// ─── Image helpers ────────────────────────────────────────────────────────────

function pngToJpeg(dataUrl: string, quality = 0.92): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0);
      resolve(c.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = dataUrl;
  });
}

async function dataUrlToPdf(dataUrl: string): Promise<string> {
  const ab    = await (await fetch(dataUrl)).arrayBuffer();
  const bytes = new Uint8Array(ab);
  const dims  = await new Promise<{w:number;h:number}>((res,rej) => {
    const img = new Image();
    img.onload  = () => res({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = rej;
    img.src = dataUrl;
  });
  const pw = Math.round(dims.w * 72/96), ph = Math.round(dims.h * 72/96);
  const isJpeg = dataUrl.startsWith("data:image/jpeg");
  const enc = new TextEncoder();
  const o1  = enc.encode("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  const o2  = enc.encode("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
  const o3  = enc.encode(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw} ${ph}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`);
  const o4h = enc.encode(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${dims.w} /Height ${dims.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter ${isJpeg?"/DCTDecode":"/FlateDecode"} /Length ${bytes.length} >>\nstream\n`);
  const o4f = enc.encode("\nendstream\nendobj\n");
  const cs  = `q ${pw} 0 0 ${ph} 0 0 cm /Im0 Do Q`;
  const o5  = enc.encode(`5 0 obj\n<< /Length ${enc.encode(cs).length} >>\nstream\n${cs}\nendstream\nendobj\n`);
  const hdr = enc.encode("%PDF-1.4\n");
  const offs: number[] = []; let off = hdr.length;
  offs.push(off); off+=o1.length;
  offs.push(off); off+=o2.length;
  offs.push(off); off+=o3.length;
  offs.push(off); off+=o4h.length+bytes.length+o4f.length;
  offs.push(off); off+=o5.length;
  const xr   = "xref\n0 6\n0000000000 65535 f \n" + offs.map(o=>`${String(o).padStart(10,"0")} 00000 n \n`).join("") + `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${off}\n%%EOF`;
  const xrB  = enc.encode(xr);
  const tot  = hdr.length+o1.length+o2.length+o3.length+o4h.length+bytes.length+o4f.length+o5.length+xrB.length;
  const pdf  = new Uint8Array(tot); let pos=0;
  const wr   = (a:Uint8Array)=>{ pdf.set(a,pos); pos+=a.length; };
  wr(hdr); wr(o1); wr(o2); wr(o3); wr(o4h); wr(bytes); wr(o4f); wr(o5); wr(xrB);
  return URL.createObjectURL(new Blob([pdf],{type:"application/pdf"}));
}

function triggerDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href=url; a.download=filename; a.style.display="none";
  document.body.appendChild(a); a.click();
  setTimeout(()=>{ document.body.removeChild(a); if(url.startsWith("blob:")) URL.revokeObjectURL(url); },1000);
}

function makeFilename(ext: string) {
  const d=new Date(), p=(n:number)=>String(n).padStart(2,"0");
  return `screenshot_${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}.${ext.toLowerCase()}`;
}

// ─── Friendly errors ──────────────────────────────────────────────────────────

function friendlyError(err: any): string {
  const m = (err?.message || "").toLowerCase();
  if (m.includes("max_capture")||m.includes("rate")||m.includes("exceeded")||m.includes("too many")||m.includes("throttl"))
    return "Chrome rate limit — retrying automatically next time";
  if (m.includes("restricted")||m.includes("chrome://"))
    return "Cannot capture browser pages (chrome://)";
  if (m.includes("permission")||m.includes("activetab"))
    return "Permission denied — reload the extension";
  if (m.includes("no active tab")||m.includes("no sender"))
    return "No active tab found";
  if (m.includes("no response"))
    return "Extension not responding — try reloading the page";
  if (m.includes("no strips"))
    return "Nothing captured — page may block screenshots";
  return err?.message || "Capture failed";
}

// ─── Selection overlay (on document.body, NOT inside shadow DOM) ─────────────

function runSelectionOverlay(): Promise<SelectionRect> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.setAttribute("data-ss-overlay","1");
    Object.assign(canvas.style, {
      position:"fixed", top:"0", left:"0", width:"100vw", height:"100vh",
      zIndex:"2147483646", cursor:"crosshair", display:"block",
    });

    const hint = document.createElement("div");
    hint.textContent = "Drag to select area  •  ESC to cancel";
    Object.assign(hint.style, {
      position:"fixed", bottom:"20px", left:"50%", transform:"translateX(-50%)",
      background:"rgba(10,10,10,0.88)", color:"#fff",
      fontFamily:"-apple-system, BlinkMacSystemFont, sans-serif",
      fontSize:"12px", fontWeight:"500", padding:"7px 18px",
      borderRadius:"20px", zIndex:"2147483647", pointerEvents:"none",
      backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.12)",
    });

    document.body.appendChild(canvas);
    document.body.appendChild(hint);

    const ctx = canvas.getContext("2d")!;
    let dragging = false;
    let r = { startX:0, startY:0, endX:0, endY:0 };

    function cleanup() { canvas.remove(); hint.remove(); document.removeEventListener("keydown", onKey); }

    function draw() {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle="rgba(0,0,0,0.46)";
      ctx.fillRect(0,0,canvas.width,canvas.height);
      if (!dragging) return;
      const x=Math.min(r.startX,r.endX), y=Math.min(r.startY,r.endY);
      const w=Math.abs(r.endX-r.startX), h=Math.abs(r.endY-r.startY);
      ctx.clearRect(x,y,w,h);
      ctx.strokeStyle="#22c55e"; ctx.lineWidth=1.5; ctx.strokeRect(x,y,w,h);
      const hs=7; ctx.fillStyle="#22c55e";
      [[x,y],[x+w-hs,y],[x,y+h-hs],[x+w-hs,y+h-hs]].forEach(([hx,hy])=>ctx.fillRect(hx,hy,hs,hs));
      if (w>50&&h>24) {
        const lbl=`${Math.round(w)} × ${Math.round(h)}`;
        ctx.font="bold 11px -apple-system,sans-serif";
        const tw=ctx.measureText(lbl).width, lx=x+w/2-tw/2-6, ly=y+h/2-11;
        ctx.fillStyle="rgba(0,0,0,0.72)";
        ctx.beginPath(); ctx.roundRect(lx,ly,tw+12,22,4); ctx.fill();
        ctx.fillStyle="#fff"; ctx.fillText(lbl,lx+6,ly+15);
      }
    }

    canvas.addEventListener("mousedown",(e)=>{ e.preventDefault(); dragging=true; r={startX:e.clientX,startY:e.clientY,endX:e.clientX,endY:e.clientY}; draw(); });
    canvas.addEventListener("mousemove",(e)=>{ if(!dragging)return; r.endX=e.clientX; r.endY=e.clientY; draw(); });
    canvas.addEventListener("mouseup",  (e)=>{
      if(!dragging)return; dragging=false; r.endX=e.clientX; r.endY=e.clientY;
      const w=Math.abs(r.endX-r.startX), h=Math.abs(r.endY-r.startY);
      cleanup();
      if(w<8||h<8){ reject(new Error("too-small")); return; }
      resolve({...r});
    });
    function onKey(e:KeyboardEvent){ if(e.key==="Escape"){ cleanup(); reject(new Error("cancelled")); } }
    document.addEventListener("keydown",onKey);
    draw();
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const Toast: React.FC<{status:"success"|"error"; message:string; onClose:()=>void}> = ({status,message,onClose}) => {
  useEffect(()=>{ const t=setTimeout(onClose,4000); return ()=>clearTimeout(t); },[onClose]);
  const ok=status==="success";
  return (
    <div style={{ position:"fixed", bottom:"88px", right:"24px", display:"flex", alignItems:"center", gap:"10px",
      background:ok?"#091a0d":"#1a0909", border:`1px solid ${ok?"rgba(34,197,94,0.2)":"rgba(239,68,68,0.2)"}`,
      borderRadius:"12px", padding:"11px 14px", zIndex:2147483647, boxShadow:"0 8px 32px rgba(0,0,0,0.6)",
      maxWidth:"290px", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      animation:"ss-toast .2s ease-out" }}>
      {ok ? <CheckCircle2 size={14} color="#22c55e" style={{flexShrink:0}} />
          : <AlertCircle  size={14} color="#ef4444" style={{flexShrink:0}} />}
      <span style={{fontSize:"12px",fontWeight:500,color:ok?"#86efac":"#fca5a5",lineHeight:1.4}}>{message}</span>
      <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:"#444",padding:0,display:"flex",flexShrink:0,marginLeft:"auto"}}>
        <X size={12}/>
      </button>
    </div>
  );
};

const CaptureProgress: React.FC<{label:string; strips:number; total:number}> = ({label,strips,total}) => {
  const pct = total > 1 ? Math.round((strips / total) * 100) : null;
  return (
    <div style={{ position:"fixed", bottom:"88px", right:"24px", background:"#111",
      border:"1px solid rgba(255,255,255,0.07)", borderRadius:"14px", padding:"13px 16px",
      zIndex:2147483647, boxShadow:"0 8px 32px rgba(0,0,0,0.65)", minWidth:"210px",
      fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      animation:"ss-toast .2s ease-out" }}>
      <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"10px"}}>
        <Loader2 size={12} color="#22c55e" style={{animation:"ss-spin .8s linear infinite",flexShrink:0}}/>
        <span style={{fontSize:"11px",color:"#aaa",fontWeight:500}}>{label}</span>
        {pct !== null && (
          <span style={{fontSize:"11px",color:"#22c55e",fontWeight:700,marginLeft:"auto"}}>{pct}%</span>
        )}
      </div>
      <div style={{height:"3px",background:"rgba(255,255,255,0.06)",borderRadius:"99px",overflow:"hidden"}}>
        {pct !== null ? (
          <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#22c55e,#16a34a)",borderRadius:"99px",transition:"width .3s ease"}}/>
        ) : (
          <div style={{height:"100%",width:"40%",background:"linear-gradient(90deg,#22c55e,#16a34a)",borderRadius:"99px",animation:"ss-progress 1.4s ease-in-out infinite"}}/>
        )}
      </div>
      {pct !== null && (
        <div style={{fontSize:"10px",color:"#555",marginTop:"6px"}}>
          Strip {strips} of ~{total}
        </div>
      )}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const FORMATS: Format[] = ["PNG","JPG","PDF"];

const ScreenShot: React.FC = () => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [open,    setOpen]    = useState(false);
  const [status,  setStatus]  = useState<Status>("idle");
  const [progLabel, setProgLabel] = useState("");
  const [progStrips, setProgStrips] = useState(0);
  const [progTotal,  setProgTotal]  = useState(0);
  const [toast, setToast] = useState<{status:"success"|"error";message:string}|null>(null);

  const [activeFormat, setActiveFormat] = useState<Format>(()=>{
    try { return (localStorage.getItem("ss-fmt") as Format)||"PNG"; } catch { return "PNG"; }
  });
  useEffect(()=>{ try{localStorage.setItem("ss-fmt",activeFormat);}catch{} },[activeFormat]);

  useEffect(()=>{
    const h=(e:MouseEvent)=>{ if(popupRef.current&&!popupRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[]);

  // ── Download pipeline ───────────────────────────────────────────────────

  const processAndDownload = useCallback(async (png:string, fmt:Format)=>{
    try {
      if (fmt==="PNG")      triggerDownload(png, makeFilename("png"));
      else if (fmt==="JPG") triggerDownload(await pngToJpeg(png), makeFilename("jpg"));
      else { const jpg=await pngToJpeg(png,.88); triggerDownload(await dataUrlToPdf(jpg), makeFilename("pdf")); }
      setStatus("success");
      setToast({status:"success", message:`Saved as ${fmt}`});
    } catch(err:any) {
      setStatus("error");
      setToast({status:"error", message:err.message||"Download failed"});
    } finally {
      setTimeout(()=>setStatus("idle"),2200);
    }
  },[]);

  // ── Capture actions ─────────────────────────────────────────────────────

  const captureVisible = useCallback(async(fmt:Format)=>{
    setStatus("capturing"); setProgLabel("Capturing viewport…"); setProgStrips(0); setProgTotal(0); setOpen(false);
    hideHost();
    try {
      const {dataUrl}=await sendToBackground<{dataUrl:string}>({type:"CAPTURE_VISIBLE"});
      await processAndDownload(dataUrl,fmt);
    } catch(err:any) {
      setStatus("error"); setToast({status:"error",message:friendlyError(err)});
      setTimeout(()=>setStatus("idle"),2200);
    } finally { showHost(); }
  },[processAndDownload]);

  const captureFullPage = useCallback(async(fmt:Format)=>{
    setOpen(false); setStatus("capturing");
    hideHost();
    try {
      const dims = getPageDimensions();
      setProgLabel("Capturing full page…");
      setProgStrips(0);
      setProgTotal(dims.estimatedStrips);

      const {dataUrl}=await sendToBackground<{dataUrl:string}>({
        type:"CAPTURE_FULL_PAGE",
        totalHeight:     dims.totalHeight,
        viewportHeight:  dims.viewportHeight,
        viewportWidth:   dims.viewportWidth,
        devicePixelRatio: dims.devicePixelRatio,
      });
      await processAndDownload(dataUrl,fmt);
    } catch(err:any) {
      setStatus("error"); setToast({status:"error",message:friendlyError(err)});
      setTimeout(()=>setStatus("idle"),2200);
    } finally { showHost(); }
  },[processAndDownload]);

  const startSelection = useCallback(async(fmt:Format)=>{
    setOpen(false); setStatus("selecting");
    hideHost();
    await new Promise(r=>setTimeout(r,100));
    try {
      const sel=await runSelectionOverlay();
      setStatus("capturing"); setProgLabel("Cropping selection…"); setProgStrips(0); setProgTotal(0);
      const x=Math.round(Math.min(sel.startX,sel.endX));
      const y=Math.round(Math.min(sel.startY,sel.endY));
      const w=Math.round(Math.abs(sel.endX-sel.startX));
      const h=Math.round(Math.abs(sel.endY-sel.startY));
      const {dataUrl}=await sendToBackground<{dataUrl:string}>({
        type:"CAPTURE_REGION", x, y, width:w, height:h, devicePixelRatio:window.devicePixelRatio||1,
      });
      await processAndDownload(dataUrl,fmt);
    } catch(err:any) {
      const m=err?.message||"";
      if(m==="cancelled"){ setStatus("idle"); return; }
      if(m==="too-small"){
        setStatus("error"); setToast({status:"error",message:"Selection too small — drag a larger area"});
        setTimeout(()=>setStatus("idle"),2200); return;
      }
      setStatus("error"); setToast({status:"error",message:friendlyError(err)});
      setTimeout(()=>setStatus("idle"),2200);
    } finally { showHost(); }
  },[processAndDownload]);

  const isCapturing = status==="capturing"||status==="selecting";

  const captureOptions = [
    { id:"fullpage" as CaptureMode, label:"Full Page",    description:"Scroll & stitch entire page", badge:null as string|null,
      icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>,
      action:()=>captureFullPage(activeFormat) },
    { id:"visible" as CaptureMode, label:"Visible Area",  description:"Current viewport only",       badge:"FAST" as string|null,
      icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>,
      action:()=>captureVisible(activeFormat) },
    { id:"selection" as CaptureMode, label:"Select Region", description:"Draw to capture an area",  badge:null as string|null,
      icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 2"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>,
      action:()=>startSelection(activeFormat) },
  ];

  return (
    <>
      <style>{`
        @keyframes ss-popIn   { from{opacity:0;transform:scale(.88) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes ss-toast   { from{opacity:0;transform:translateX(12px)} to{opacity:1;transform:translateX(0)} }
        @keyframes ss-spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes ss-progress{ 0%{margin-left:-50%;width:40%} 50%{margin-left:30%;width:50%} 100%{margin-left:110%;width:40%} }
      `}</style>

      {isCapturing && status==="capturing" && (
        <CaptureProgress label={progLabel} strips={progStrips} total={progTotal}/>
      )}

      {toast && <Toast status={toast.status} message={toast.message} onClose={()=>setToast(null)}/>}

      <div ref={popupRef} style={{position:"fixed",bottom:"24px",right:"24px",zIndex:2147483645,fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"}}>

        {open && !isCapturing && (
          <div onMouseDown={e=>e.stopPropagation()} style={{
            position:"absolute", bottom:"74px", right:0, width:"222px",
            background:"#161616", borderRadius:"18px", padding:"10px",
            border:"1px solid rgba(255,255,255,0.07)",
            boxShadow:"0 24px 60px rgba(0,0,0,0.7),inset 0 0 0 1px rgba(255,255,255,0.03)",
            animation:"ss-popIn .22s cubic-bezier(0.34,1.56,0.64,1)", transformOrigin:"bottom right",
          }}>
            {/* Format picker */}
            <div style={{display:"flex",gap:"4px",background:"#0d0d0d",padding:"4px",borderRadius:"11px",marginBottom:"8px"}}>
              {FORMATS.map(fmt=>{
                const active=activeFormat===fmt;
                return <div key={fmt} onClick={()=>setActiveFormat(fmt)} style={{
                  flex:1, textAlign:"center", padding:"6px 0", borderRadius:"8px", cursor:"pointer",
                  fontSize:"10px", fontWeight:700, letterSpacing:"0.5px", userSelect:"none", transition:"all .18s",
                  background:active?"linear-gradient(135deg,#22c55e,#16a34a)":"transparent",
                  color:active?"#fff":"#555", boxShadow:active?"0 2px 8px rgba(34,197,94,0.3)":"none",
                }}>{fmt}</div>;
              })}
            </div>

            <div style={{height:"1px",background:"rgba(255,255,255,0.05)",margin:"8px 0"}}/>

            <div style={{display:"flex",flexDirection:"column",gap:"3px"}}>
              {captureOptions.map(opt=>(
                <div key={opt.id} onClick={opt.action}
                  style={{display:"flex",alignItems:"center",gap:"10px",padding:"8px 9px",borderRadius:"12px",cursor:"pointer",transition:"background .15s"}}
                  onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.06)"; const ic=(e.currentTarget as HTMLElement).querySelector(".ss-ic") as HTMLElement; if(ic){ic.style.background="rgba(34,197,94,0.15)";ic.style.color="#22c55e";} }}
                  onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background="transparent"; const ic=(e.currentTarget as HTMLElement).querySelector(".ss-ic") as HTMLElement; if(ic){ic.style.background="#1e1e1e";ic.style.color="#777";} }}
                >
                  <div className="ss-ic" style={{width:"32px",height:"32px",borderRadius:"9px",background:"#1e1e1e",display:"flex",alignItems:"center",justifyContent:"center",color:"#777",flexShrink:0,transition:"all .15s"}}>
                    {opt.icon}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:"12px",fontWeight:600,color:"#e0e0e0",whiteSpace:"nowrap"}}>{opt.label}</div>
                    <div style={{fontSize:"10px",color:"#4a4a4a",marginTop:"1px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{opt.description}</div>
                  </div>
                  {opt.badge&&<span style={{fontSize:"8.5px",fontWeight:800,letterSpacing:"0.4px",padding:"2px 6px",borderRadius:"99px",background:"rgba(34,197,94,0.1)",color:"#22c55e",border:"1px solid rgba(34,197,94,0.2)",flexShrink:0}}>{opt.badge}</span>}
                </div>
              ))}
            </div>
          </div>
        )}




        <div style={{display:"flex",alignItems:"center",gap:"6px",justifyContent:"flex-end"}}>

          <div
         


  onMouseEnter={(e) => {
    // e.currentTarget.style.opacity = "1";

    e.currentTarget.style.background = "#222";
    e.currentTarget.style.transform = "scale(1.1)";
    e.currentTarget.style.boxShadow =
      "0 8px 20px rgba(0,0,0,.25)";
  }}
  onMouseLeave={(e) => {
    // e.currentTarget.style.opacity = "0.2";

    e.currentTarget.style.background = "#1a1a1a";
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.boxShadow =
      "0 3px 10px rgba(0,0,0,.18)";
  }}
  onMouseDown={(e) => {
    e.stopPropagation()
    e.currentTarget.style.background = "#111";
    e.currentTarget.style.transform = "scale(0.96)";
    e.currentTarget.style.boxShadow =
      "inset 0 3px 8px rgba(0,0,0,.4)";
  }}
  onMouseUp={(e) => {
    e.currentTarget.style.background = "#222";
    e.currentTarget.style.transform = "scale(1.02)";
    e.currentTarget.style.boxShadow =
      "0 8px 20px rgba(0,0,0,.25)";
  }}
    
           
           
           onClick={()=>!isCapturing&&setOpen(p=>!p)}
            style={{width:"28px",height:"28px",borderRadius:"50%",background:"#191919",border:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"center",cursor:isCapturing?"not-allowed":"pointer",color:"#777",boxShadow:"0 4px 10px rgba(0,0,0,0.4)",opacity:isCapturing?.3:1}}
            // onMouseEnter={e=>!isCapturing&&((e.currentTarget as HTMLElement).style.background="#222")}
            // onMouseLeave={e=>((e.currentTarget as HTMLElement).style.background="#191919")}
          >
            <ChevronUp size={13} style={{transition:"transform .25s",transform:open?"rotate(0deg)":"rotate(180deg)"}}/>
          </div>

         <Tippy
         content={<span   style={{
          color: "#EAEAEA",
          fontSize: "16px",
          fontWeight: 500,
          letterSpacing: "0.2px",
          background: "#1E1E1E",
          padding: "7px 11px",
          borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow:
            "0 8px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.03)",
        }}>ScreenShot</span>}   
        
        animation="shift-away-subtle"
        duration={[160, 110]}
        delay={[120, 0]}
        placement="top"
        offset={[10, 10]}

         appendTo={(ref) => {
           const root = ref.getRootNode();
        
           if (root instanceof ShadowRoot) {
             return root as unknown as Element; // 👈 safe cast for Tippy
           }
        
           return document.body;
         }}
         >
         <div 
          
          onMouseEnter={(e) => {
            // e.currentTarget.style.opacity = "1";
        
            e.currentTarget.style.background = "#222";
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow =
              "0 8px 20px rgba(0,0,0,.25)";
          }}
          onMouseLeave={(e) => {
            // e.currentTarget.style.opacity = "0.2";
        
            e.currentTarget.style.background = "#1a1a1a";
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow =
              "0 3px 10px rgba(0,0,0,.18)";
          }}
          onMouseDown={(e) => {
            e.stopPropagation()
            e.currentTarget.style.background = "#111";
            e.currentTarget.style.transform = "scale(0.96)";
            e.currentTarget.style.boxShadow =
              "inset 0 3px 8px rgba(0,0,0,.4)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.background = "#222";
            e.currentTarget.style.transform = "scale(1.02)";
            e.currentTarget.style.boxShadow =
              "0 8px 20px rgba(0,0,0,.25)";
          }}
            
                  onClick={()=>{ if(!isCapturing) captureVisible(activeFormat); }}
                    title={isCapturing?(status==="selecting"?"Selecting area…":"Capturing…"):`Capture ${activeFormat}`}
                    style={{width:"54px",height:"54px",borderRadius:"50%",
                      background:isCapturing?"linear-gradient(145deg,#0f2018,#0a1810)":"linear-gradient(145deg,#1d1d1d,#141414)",
                      display:"flex",alignItems:"center",justifyContent:"center",
                      cursor:isCapturing?"default":"pointer",
                      border:isCapturing?"1px solid rgba(34,197,94,0.3)":"1px solid rgba(255,255,255,0.08)",
                      boxShadow:isCapturing?"0 0 24px rgba(34,197,94,0.2),0 8px 24px rgba(0,0,0,0.5)":"0 8px 24px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.05)",
                    }}
                    // onMouseEnter={e=>{ if(!isCapturing)(e.currentTarget as HTMLElement).style.transform="scale(1.07)"; }}
                    // onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.transform="scale(1)"; }}
                  >
                    {isCapturing         ? <Loader2      size={17} color="#22c55e" style={{animation:"ss-spin .8s linear infinite"}}/>
                    : status==="success" ? <CheckCircle2 size={17} color="#22c55e"/>
                    : status==="error"   ? <AlertCircle  size={17} color="#ef4444"/>
                    :                      <Download     size={17} color="#c8c8c8"/>}
                  </div>
         </Tippy>


        </div>
      </div>
    </>
  );
};

export default ScreenShot;