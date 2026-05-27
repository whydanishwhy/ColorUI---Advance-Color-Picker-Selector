import React, { useEffect, useMemo, useState,useRef } from 'react';
import SearchBar from '../UI-Models/SearchBar';
import ColorInput from '../UI-Models/ColorInput';
import DragNumberInput from '../UI-Models/DragNumberInput';
import { Box, Camera, ALargeSmall, Brush, PenTool, TextAlignStart ,TextAlignJustify,TextAlignEnd, Wallpaper,Ban, Check,MessageCircleQuestionMark,SquareRoundCorner,PanelRightDashed,Eclipse, FileInput,Stone,Tag,SquareMousePointer, CaseSensitive} from 'lucide-react';
import Tippy from '@tippyjs/react';
import ColorUI from './ColorUI';
import ScreenShot from './ScreenShot';
import ColorSelector from './ColorSelector';
import Notepad from './NotePad';
import interact from 'interactjs';
import Joystick3D from '../UI-Models/Joystick3D';
import InstructionSelectElement from './InstructionSelectElement';
import Switch from '../UI-Models/Switch';
import { SingleFocusLists, ListData } from './../UI-Models/SingleListItem';
import { ExportElement } from './ExportElement';
import AskAI from './AskAI';

interface PanelProps {
  element: HTMLElement | null;
  isDragging: boolean;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
  isDraggingRef: React.MutableRefObject<boolean>;
  setIsActive:React.Dispatch<React.SetStateAction<boolean>>;


}


// --- Dimensions ---
const DimensionsPanel:  React.FC<PanelProps> = ({ element, isDragging, setIsDragging, isDraggingRef,setIsActive }) =>
 
{
  const [setInstrcutionPage, setsetInstrcutionPage] = useState(true)
  const tabs = ["Padding", "Margin"] as const;
type TabType = (typeof tabs)[number];


  const [activeTab, setActiveTab] = useState<TabType>("Padding");


  useEffect(()=>{
    setIsActive(true)
    if(element){
      setsetInstrcutionPage(false)
    }else{
      setsetInstrcutionPage(true)
    }
    return()=>{
      setIsActive(false)

}
  },[element])

  const TabHeader = () => (
    <div style={styles.tabBar}>
      {tabs.map((tab) => (
        <div
          key={tab}
          onClick={() => setActiveTab(tab)}
          style={{
            ...styles.tab,
            ...(activeTab === tab ? styles.activeTab : {})
          }}
        >
          {tab}
          {activeTab === tab && <div style={styles.indicator} />}
        </div>
      ))}
    </div>
  );
  return (
  <div>
    
      {setInstrcutionPage?<InstructionSelectElement /> : 
       <div>
        <TabHeader />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px' }}>
     
      {activeTab === "Padding" &&   <div style={{ display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "8px",}}>
   
     <DragNumberInput
        isDragging={isDragging} setIsDragging={setIsDragging} isDraggingRef={isDraggingRef}
        element={element} property="paddingTop" symbol="T" label="Top" min={0} max={2000} step={1}
      />
       <DragNumberInput
        isDragging={isDragging} setIsDragging={setIsDragging} isDraggingRef={isDraggingRef}
        element={element} property="paddingLeft" symbol="L" label="Left" min={0} max={2000} step={1}
      />
       <DragNumberInput
        isDragging={isDragging} setIsDragging={setIsDragging} isDraggingRef={isDraggingRef}
        element={element} property="paddingBottom" symbol="B" label="Bottom" min={0} max={2000} step={1}
      />
       <DragNumberInput
        isDragging={isDragging} setIsDragging={setIsDragging} isDraggingRef={isDraggingRef}
        element={element} property="paddingRight" symbol="R" label="Right" min={0} max={2000} step={1}
      />
  
     
     </div> }

   
    
     {activeTab === "Margin" &&    <div style={{ display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "8px",}}>
     <DragNumberInput
        isDragging={isDragging} setIsDragging={setIsDragging} isDraggingRef={isDraggingRef}
        element={element} property="marginTop" symbol="T" label="Top" min={0} max={2000} step={1}
      />
       <DragNumberInput
        isDragging={isDragging} setIsDragging={setIsDragging} isDraggingRef={isDraggingRef}
        element={element} property="marginLeft" symbol="L" label="Left" min={0} max={2000} step={1}
      />
       <DragNumberInput
        isDragging={isDragging} setIsDragging={setIsDragging} isDraggingRef={isDraggingRef}
        element={element} property="marginBottom" symbol="B" label="Bottom" min={0} max={2000} step={1}
      />
       <DragNumberInput
        isDragging={isDragging} setIsDragging={setIsDragging} isDraggingRef={isDraggingRef}
        element={element} property="marginRight" symbol="R" label="Right" min={0} max={2000} step={1}
      />
  
{/*   
  <DragNumberInput
        isDragging={isDragging} setIsDragging={setIsDragging} isDraggingRef={isDraggingRef}
        element={element} property="margin" symbol="P" label="Width" min={0} max={2000} step={1}
      /> */}
  
     
     </div> }
  
  
  
    </div>
       </div>
       }
  </div>
  );
}


const PRESETS = [
    "transparent",
    "#FFFFFF",
    "#000000",
    "#FFA500",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)",
  "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
  "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
 
  // Add as many presets as you like here...
];

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: "#181818",
    color: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    fontFamily: "Inter, sans-serif"
  },

  // Tabs
  tabBar: {
    display: "flex",
    gap: 6,
    padding: 10,
    background: "rgba(255,255,255,0.04)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(10px)"
  },

  tab: {
    position: "relative",
    padding: "8px 12px",
    fontSize: 13,
    cursor: "pointer",
    borderRadius: 8,
    color: "#aaa",
    textTransform: "capitalize",
    transition: "0.2s"
  },

  activeTab: {
    background: "rgba(255,255,255,0.04)",
    color: "#fff"
  },

  indicator: {
    position: "absolute",
    bottom: -6,
    left: 8,
    right: 8,
    height: 2,
    borderRadius: 2,
    background: "rgba(59, 157, 85)"
  },

  // Panels
  panel: {
    padding: 14
  },

  addBtn: {
    padding: "12px 14px",
    marginBottom: 18,
    borderRadius: 10,
    background: "rgba(255,255,255,0.06)",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    transition: "0.2s"
  },

  title: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 10
  },

  grid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    padding: 10,
    background: "#232323",
    borderRadius: 12
  },

  circle: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    cursor: "pointer",
    transition: "0.2s",
    transform: "scale(1)"
  }
};
// --- Background ---

const tabs = ["solid", "linear", "radial", "image", "texture"] as const;
type TabType = (typeof tabs)[number];

const BackgroundPanel: React.FC<
  Pick<PanelProps, "element" | "setIsActive">
> = ({ element, setIsActive }) => {
  const [instructionPage, setInstructionPage] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("solid");

  const [bgColor, setBgColor] = useState("");
  const [addColorToggle, setAddColorToggle] = useState(false);

  useEffect(() => {
    setIsActive(true);

    if (element) setInstructionPage(false);
    else setInstructionPage(true);

    return () => setIsActive(false);
  }, [element]);

  // =========================
  // TAB HEADER
  // =========================
  const TabHeader = () => (
    <div style={styles.tabBar}>
      {tabs.map((tab) => (
        <div
          key={tab}
          onClick={() => setActiveTab(tab)}
          style={{
            ...styles.tab,
            ...(activeTab === tab ? styles.activeTab : {})
          }}
        >
          {tab}
          {activeTab === tab && <div style={styles.indicator} />}
        </div>
      ))}
    </div>
  );

  // =========================
  // SOLID BACKGROUND
  // =========================
  
   const SolidPanel = () => 
    
  {  
    type Gradient = (typeof PRESETS)[number];

    const [hovered, setHovered] = useState<Gradient | null>(null);

    return (
    <div style={styles.panel}>
      {/* <div
        onClick={() => setAddColorToggle((p) => !p)}
        style={styles.addBtn}
      >
        <span style={{ fontSize: 18, marginRight: 6 }}>+</span>
        Add Background Layer
      </div> */}

    <ColorInput
          element={element}
          mode="backgroundColor"
          Bgcolor={bgColor}
        />


      <div style={styles.title}>Presets</div>

      <div style={styles.grid}>
  {PRESETS.map((grad) =>
    grad === "transparent" ? (
      <div
        key={grad}
        onClick={() => {
          if (element) element.style.background = grad;
          setBgColor(grad);
        }}
        onMouseEnter={() => setHovered(grad)}
        onMouseLeave={() => setHovered(null)}
        style={{
          ...styles.circle,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: bgColor === grad ? "1px solid #fff" : "1px solid #555",
          cursor: "pointer",
          transform: hovered === grad ? "scale(1.1)" : "scale(1)",
          transition: "transform 0.2s ease"
        }}
      >
        <Ban color="red" />
      </div>
    ) : (
      <div
        key={grad}
        onClick={() => {
          if (element) element.style.background = grad;
          setBgColor(grad);
        }}
        onMouseEnter={() => setHovered(grad)}
        onMouseLeave={() => setHovered(null)}
        style={{
          ...styles.circle,
          background: grad,
          border:
            bgColor === grad ? "1px solid #fff" : "1px solid transparent",
          boxShadow:
            bgColor === grad ? "0 0 0 2px rgba(0,0,0,0.2)" : "none",
          cursor: "pointer",
          transform: hovered === grad ? "scale(1.1)" : "scale(1)",
          transition: "transform 0.2s ease"
        }}
      />
    )
  )}
</div>
    </div>
  )}

  // =========================
  // PLACEHOLDER PANELS (ready for future)
  // =========================
  const LinearPanel = () => (
    <div style={styles.panel}>Linear Gradient Editor (Coming Soon)</div>
  );

  const RadialPanel = () => (
    <div style={styles.panel}>Radial Gradient Editor (Coming Soon)</div>
  );

  type FitMode = "cover" | "contain" | "auto";

  interface BgState {
    image: string | null;
    fit: FitMode;
    posX: number;
    posY: number;
    scale: number;
    repeat: boolean;
  }
  
  const ImagePanel = () => {
    const [bg, setBg] = useState<BgState>({
      image: null, fit: "cover", posX: 50, posY: 50, scale: 100, repeat: false,
    });
    const [isDragging, setIsDragging] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [showBadge, setShowBadge] = useState(false);
  
    const fileRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const badgeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const drag = useRef({ startX: 0, startY: 0, startPosX: 50, startPosY: 50 });
  
    const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

    useEffect(() => {
  if (!element) return;

  const styles = getBgStyle(bg);

  Object.assign(element.style, {
    backgroundImage: styles.backgroundImage || "",
    backgroundSize: styles.backgroundSize || "",
    backgroundPosition: styles.backgroundPosition || "",
    backgroundRepeat: styles.backgroundRepeat || "",
  });

}, [bg]);
  
    const getBgStyle = (s: BgState): React.CSSProperties => {
      if (!s.image) return {};
      return {
        backgroundImage: `url(${s.image})`,
        backgroundSize: s.fit === "auto" ? `${s.scale}%` : s.fit,
        backgroundPosition: `${Math.round(s.posX)}% ${Math.round(s.posY)}%`,
        backgroundRepeat: s.repeat ? "repeat" : "no-repeat",
      };
    };
    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
    
      const reader = new FileReader();
      reader.onload = (ev) => {
        setBg((p) => ({ ...p, image: ev.target?.result as string }));
        setShowHint(true);
    
        if (hintTimer.current !== null) {
          clearTimeout(hintTimer.current);
        }
    
        hintTimer.current = setTimeout(() => setShowHint(false), 2800);
      };
    
      reader.readAsDataURL(file);
    };
  
    const handleDelete = () => {
      setBg({ image: null, fit: "cover", posX: 50, posY: 50, scale: 100, repeat: false });
      setShowHint(false);
      if (fileRef.current) fileRef.current.value = "";
    };
  
    const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!bg.image) return;
      drag.current = { startX: e.clientX, startY: e.clientY, startPosX: bg.posX, startPosY: bg.posY };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setIsDragging(true);
      setShowHint(false);
      setShowBadge(true);
      e.preventDefault();
    };
  
    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const dx = (e.clientX - drag.current.startX) / rect.width * 100;
      const dy = (e.clientY - drag.current.startY) / rect.height * 100;
      setBg((p) => ({
        ...p,
        posX: clamp(drag.current.startPosX - dx, 0, 100),
        posY: clamp(drag.current.startPosY - dy, 0, 100),
      }));
    };
  
    const onPointerUp = () => {
      setIsDragging(false);
    
      if (badgeTimer.current !== null) {
        clearTimeout(badgeTimer.current);
      }
    
      badgeTimer.current = setTimeout(() => setShowBadge(false), 1200);
    };
  
    const s = bg;
  
    // shared inline styles
    const pill: React.CSSProperties = { display:"flex", alignItems:"center", gap:6, padding:"8px 18px", borderRadius:999, border:"0.5px solid #ccc", background:"#fff", fontSize:13, fontWeight:500, cursor:"pointer" };
    const toolLabel: React.CSSProperties = { fontSize:11, fontWeight:500, color:"#999", textTransform:"uppercase" as const, letterSpacing:"0.06em", whiteSpace:"nowrap" as const };
    const fitBtn = (active: boolean): React.CSSProperties => ({ padding:"5px 10px", borderRadius:6, border:`0.5px solid ${active?"#555":"#ddd"}`, background: active?"#fff":"#f5f5f5", fontSize:12, fontWeight: active?500:400, color: active?"#111":"#666", cursor:"pointer" });
  
    return (
      <div style={{ display:"flex", flexDirection:"column", border:"0.5px solid #ddd", borderRadius:12, overflow:"hidden", fontFamily:"sans-serif", maxWidth:680 }}>
        {/* Canvas */}
        <div ref={canvasRef}
          style={{ position:"relative", height:260, background:"#f5f5f5", overflow:"hidden", cursor: s.image ? (isDragging ? "grabbing" : "grab") : "default", ...getBgStyle(s) }}
          onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
  
          {/* Empty state */}
          {!s.image && (
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12 }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span style={{ fontSize:13, color:"#aaa" }}>No background set</span>
              <label style={pill}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Upload image
                <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile} />
              </label>
            </div>
          )}
  
          {/* Drag hint — shown briefly after upload */}
          {s.image && showHint && (
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8, pointerEvents:"none", transition:"opacity 0.4s" }}>
              <div style={{ position:"relative", width:52, height:52 }}>
                {[
                  { cls:"up",    style:{ top:0, left:"50%", transform:"translateX(-50%)" }, d:"M3,7 6,3 9,7" },
                  { cls:"down",  style:{ bottom:0, left:"50%", transform:"translateX(-50%)" }, d:"M3,3 6,7 9,3" },
                  { cls:"left",  style:{ left:0, top:"50%", transform:"translateY(-50%)" }, d:"M7,3 3,6 7,9" },
                  { cls:"right", style:{ right:0, top:"50%", transform:"translateY(-50%)" }, d:"M3,3 7,6 3,9" },
                ].map(arm => (
                  <div key={arm.cls} style={{ position:"absolute", width:20, height:20, borderRadius:4, border:"0.5px solid #ccc", background:"rgba(255,255,255,0.92)", display:"flex", alignItems:"center", justifyContent:"center", ...arm.style }}>
                    <svg width="10" height="10" viewBox="0 0 10 10"><polyline points={arm.d} fill="none" stroke="#666" strokeWidth="1.5"/></svg>
                  </div>
                ))}
                <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:10, height:10, borderRadius:"50%", background:"#ccc" }} />
              </div>
              <span style={{ fontSize:11, color:"rgba(80,80,80,0.8)", background:"rgba(255,255,255,0.8)", padding:"3px 8px", borderRadius:4 }}>Drag to reposition</span>
            </div>
          )}
  
          {/* Delete button */}
          {s.image && (
            <button onClick={handleDelete} style={{ position:"absolute", top:10, right:10, width:28, height:28, borderRadius:"50%", border:"0.5px solid #ccc", background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", zIndex:4 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M9 6V4h6v2M14 11v6M10 11v6"/></svg>
            </button>
          )}
  
          {/* Live position badge while dragging */}
          {s.image && (
            <div style={{ position:"absolute", bottom:10, left:10, fontSize:11, fontFamily:"monospace", color:"#555", background:"rgba(255,255,255,0.9)", border:"0.5px solid #ddd", borderRadius:4, padding:"3px 7px", zIndex:4, opacity: showBadge ? 1 : 0, transition:"opacity 0.2s" }}>
              {Math.round(s.posX)}% {Math.round(s.posY)}%
            </div>
          )}
        </div>
  
        {/* Toolbar */}
        <div style={{ display:"flex", alignItems:"center", borderTop:"0.5px solid #ddd" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 16px", borderRight:"0.5px solid #ddd" }}>
            <span style={toolLabel}>Fit</span>
            <div style={{ display:"flex", gap:4 }}>
              {(["cover","contain","auto"] as FitMode[]).map(mode => (
                <button key={mode} onClick={() => setBg(p => ({ ...p, fit: mode }))} style={fitBtn(s.fit === mode)}>{mode}</button>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, padding:"12px 16px", borderRight:"0.5px solid #ddd" }}>
            <span style={toolLabel}>Scale</span>
            <input type="range" min={10} max={300} value={s.scale} step={1} disabled={s.fit !== "auto"}
              style={{ flex:1, opacity: s.fit === "auto" ? 1 : 0.3 }}
              onChange={e => setBg(p => ({ ...p, scale: +e.target.value }))} />
            <span style={{ fontSize:12, color:"#666", fontFamily:"monospace", minWidth:32, textAlign:"right" }}>{s.scale}%</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6, padding:"12px 16px" }}>
            <span style={toolLabel}>Repeat</span>
            <input type="checkbox" checked={s.repeat} onChange={e => setBg(p => ({ ...p, repeat: e.target.checked }))} />
          </div>
        </div>
      </div>
    );
  };
  const TexturePanel = () => (
    <div style={styles.panel}>Texture / Pattern Library (Coming Soon)</div>
  );

  // =========================
  // MAIN UI
  // =========================
  return (
    <div style={styles.container}>
      {instructionPage ? (
        <InstructionSelectElement />
      ) : (
        <>
          <TabHeader />

          {activeTab === "solid" && <SolidPanel />}
          {activeTab === "linear" && <LinearPanel />}
          {activeTab === "radial" && <RadialPanel />}
          {activeTab === "image" && <ImagePanel />}
          {activeTab === "texture" && <TexturePanel />}
        </>
      )}
    </div>
  );
};


// --- Text ---

const GOOGLE_FONTS = [
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Inter",
  "Raleway",
  "Playfair Display",
  "Merriweather",
  "Nunito",
  "Oswald",
  "Source Sans Pro",
  "Ubuntu",
  "Rubik",
  "BJCree"
];

// dynamically load Google Font
const loadGoogleFont = (font: string) => {
  const id = `gf-${font.replace(/\s+/g, "-")}`;

  if (document.getElementById(id)) return;

  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${font.replace(
    /\s+/g,
    "+"
  )}:wght@300;400;500;600;700&display=swap`;

  document.head.appendChild(link);
};



export const TextPanel: React.FC<PanelProps> = ({
  element,
  isDragging,
  setIsDragging,
  isDraggingRef,
  setIsActive,
}) => {
  const [useBgAsText, setuseBgAsText] = useState(false);
  const [instructionPage, setInstructionPage] = useState(true);
  const [Bgcolor, setBgColor] = useState("");

  const [fontSearch, setFontSearch] = useState("");
  const [fontFamily, setFontFamily] = useState("Inter");

  useEffect(() => {
    setIsActive(true);

    if (element) {
      setInstructionPage(false);
    } else {
      setInstructionPage(true);
    }

    return () => setIsActive(false);
  }, [element]);

  // filter fonts
  const filteredFonts = useMemo(() => {
    return GOOGLE_FONTS.filter((f) =>
      f.toLowerCase().includes(fontSearch.toLowerCase())
    );
  }, [fontSearch]);

  const handleFontChange = (font: string) => {
    setFontFamily(font);

    loadGoogleFont(font);

    if (element) {
      element.style.fontFamily = font;
    }
  };

  return (
    <div>
      {instructionPage ? (
        <InstructionSelectElement />
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            padding: "12px",
          }}
        >
          {/* COLOR */}
          <ColorInput element={element} mode={"color"} Bgcolor={Bgcolor} />

          {/* FONT SELECTOR */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: 12, opacity: 0.7 }}>
              Font Family (Google Fonts)
            </label>

            {/* <input
              value={fontSearch}
              onChange={(e) => setFontSearch(e.target.value)}
              placeholder="Search fonts..."
              style={{
                padding: "6px",
                border: "1px solid #ccc",
                borderRadius: 6,
              }}
            /> */}

            <select
              value={fontFamily}
              onChange={(e) => handleFontChange(e.target.value)}
              style={{
                padding: "6px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            >
              {filteredFonts.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          {/* FONT WEIGHT */}
          <DragNumberInput
            isDragging={isDragging}
            setIsDragging={setIsDragging}
            isDraggingRef={isDraggingRef}
            element={element}
            property="fontWeight"
            symbol="FW"
            label="Font Weight"
            min={100}
            max={900}
            step={100}
          />

          {/* FONT SIZE */}
          <DragNumberInput
            isDragging={isDragging}
            setIsDragging={setIsDragging}
            isDraggingRef={isDraggingRef}
            element={element}
            property="fontSize"
            symbol={"A"}
            label="Font Size"
            min={0}
            max={200}
            step={1}
          />

          {/* LETTER SPACING */}
          <DragNumberInput
            isDragging={isDragging}
            setIsDragging={setIsDragging}
            isDraggingRef={isDraggingRef}
            element={element}
            property="letterSpacing"
            symbol="LS"
            label="Letter Spacing"
            min={-10}
            max={100}
            step={1}
          />

          {/* TEXT ALIGN */}
          <div>
            <TextAlignStart />
            <TextAlignJustify />
            <TextAlignEnd />
          </div>

          {/* BG AS TEXT */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            <Switch color={"#242424"}
              checked={useBgAsText}
              onChange={() => {
                setuseBgAsText((pre) => !pre);

                if (element && useBgAsText) {
                  element.style.webkitBackgroundClip = "text";
                  element.style.webkitTextFillColor = "transparent";
                } else if (element) {
                  element.style.webkitBackgroundClip = "";
                  element.style.webkitTextFillColor = "";
                }
              }}
            />
            use background as text color
          </div>
        </div>
      )}
    </div>
  );
};
  


// --- Shadow ---
const ShadowPanel: React.FC<Pick<PanelProps, "element" | "setIsActive">> = ({
  element,
  setIsActive,
}) => {
  const padRef = useRef<HTMLDivElement | null>(null);

  // 🎯 state
  const [x, setX] = useState(10);
  const [y, setY] = useState(10);
  const [blur, setBlur] = useState(20);
  const [spread, setSpread] = useState(0);
  const [color, setColor] = useState("#000000");
  const [inset, setInset] = useState(false);
  const [useDropShadow, setUseDropShadow] = useState(true); // ✅ default ON

  // ✅ simpler: derive instead of storing
  const showInstruction = !element;

  // 🎯 activate panel
  useEffect(() => {
    setIsActive(true);
    return () => setIsActive(false);
  }, []);

  // 🎯 memoized shadow string (cleaner + avoids recompute)
  const shadowValue = useMemo(() => {
    return useDropShadow
      ? `drop-shadow(${x}px ${y}px ${blur}px ${color})`
      : `${inset ? "inset " : ""}${x}px ${y}px ${blur}px ${spread}px ${color}`;
  }, [x, y, blur, spread, color, inset, useDropShadow]);

  // 🎯 apply styles
  useEffect(() => {
    if (!element) return;

    if (useDropShadow) {
      // ⚠️ safer: append instead of overwrite
      element.style.filter = shadowValue;
      element.style.boxShadow = "";
    } else {
      element.style.boxShadow = shadowValue;
      element.style.filter = "";
    }
  }, [shadowValue, element, useDropShadow]);

  // 🎮 optimized drag (calculate once on mousedown)
  const handleDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = padRef.current?.getBoundingClientRect();
    if (!rect) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const move = (ev: MouseEvent) => {
      setX(Math.round((ev.clientX - centerX) / 2));
      setY(Math.round((ev.clientY - centerY) / 2));
    };

    const stop = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", stop);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stop);
  };

  // 🎨 UI
  if (showInstruction) return <InstructionSelectElement />;

  return (
    <div style={{ padding: 20 }}>

      {/* 🎮 XY Pad */}
      <div>
        <label>Drag to control X/Y</label>
        <div
          ref={padRef}
          onMouseDown={handleDrag}
          style={{
            width: 150,
            height: 150,
            border: "1px solid #ccc",
            position: "relative",
            marginBottom: 10,
            cursor: "crosshair",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              width: 10,
              height: 10,
              background: "red",
              borderRadius: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>
        <div>X: {x} | Y: {y}</div>
      </div>

      {/* 🎚 Blur */}
      <div>
        <label>Blur</label>
        <Tippy content={`Blur: ${blur}`}>
          <input
            type="range"
            min={0}
            max={100}
            value={blur}
            onChange={(e) => setBlur(+e.target.value)}
          />
        </Tippy>
      </div>

      {/* 🎚 Spread (only for box-shadow) */}
      {!useDropShadow && (
        <div>
          <label>Spread</label>
          <Tippy content={`Spread: ${spread}`} zIndex={9999}>
            <input
              type="range"
              min={-50}
              max={50}
              value={spread}
              onChange={(e) => setSpread(+e.target.value)}
            />
          </Tippy>
        </div>
      )}

      {/* 🎨 Color */}
      <div>
        <label>Color</label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </div>

      {/* 🔁 Inset (only box-shadow) */}
      {!useDropShadow && (
        <div>
          <label>
            <input
              type="checkbox"
              checked={inset}
              onChange={() => setInset((p) => !p)}
            />
            Inset
          </label>
        </div>
      )}

      {/* 🌫 Toggle */}
      <div>
        <label>
          <input
            type="checkbox"
            checked={useDropShadow}
            onChange={() => setUseDropShadow((p) => !p)}
          />
          Use drop-shadow
        </label>
      </div>

    </div>
  );
};



// --- Border ---
const BorderPanel: React.FC<PanelProps> = ({ element ,setIsDragging,isDragging,isDraggingRef,setIsActive}) => 
  
{
  const [setInstrcutionPage, setsetInstrcutionPage] = useState(true)

  useEffect(()=>{
    setIsActive(true)
    if(element){
      setsetInstrcutionPage(false)
    }else{
      setsetInstrcutionPage(true)
    }
    return()=>{
      setIsActive(false)
  
  }
  },[element])

  return (
    <div style={{ padding: '12px' }}>
  
      
        <ColorInput Bgcolor='null' element={element} mode={"borderColor"} />
  
        
       
    
  <DragNumberInput
        isDragging={isDragging} setIsDragging={setIsDragging} isDraggingRef={isDraggingRef}
        element={element} property="borderWidth" symbol="BR" label="Border Radius" min={0} max={99999999} step={1}
      />
  
  <DragNumberInput
        isDragging={isDragging} setIsDragging={setIsDragging} isDraggingRef={isDraggingRef}
        element={element} property="borderRadius" symbol="BR" label="Border Radius" min={0} max={99999999} step={1}
      />
  
    </div>
  )
}

// --- Transform ---
const TransformPanel: React.FC<Pick<PanelProps, 'element' | 'setIsActive'>> = ({ element ,setIsActive}) => 
  
{
  const [setInstrcutionPage, setsetInstrcutionPage] = useState(true)

  useEffect(()=>{
    setIsActive(true)
    if(element){
      setsetInstrcutionPage(false)
    }else{
      setsetInstrcutionPage(true)
    }
    return()=>{
      setIsActive(false)
  
  }
  },[element])

  return (
    <div style={{ padding: '12px' }}>
      <Joystick3D element={element} />
  
    {/* Rotate , Scale , Skew */}
  
      {/* <DragNumberInput
          isDragging={isDragging} setIsDragging={setIsDragging} isDraggingRef={isDraggingRef}
          element={element} property="fontWeight" symbol="FW" label="Font Weight" min={100} max={900} step={100}
        /> */}
  
    </div>
  )
}


const FreeDraw: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawingRef = useRef(false);

  const [brushColor, setBrushColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [history, setHistory] = useState<string[]>([]);

  const startDrawing = (e: MouseEvent) => {
    if (!ctxRef.current) return;

    drawingRef.current = true;

    ctxRef.current.beginPath();
    ctxRef.current.moveTo(e.clientX, e.clientY);
  };

  const draw = (e: MouseEvent) => {
    if (!drawingRef.current || !ctxRef.current) return;

    ctxRef.current.lineTo(e.clientX, e.clientY);
    ctxRef.current.stroke();
  };

  const stopDrawing = () => {
    if (!drawingRef.current || !canvasRef.current) return;

    drawingRef.current = false;

    const dataUrl = canvasRef.current.toDataURL();
    setHistory((prev) => [...prev, dataUrl]);
  };

  useEffect(() => {
    return () => {
      const canvas = canvasRef.current;
  
      if (canvas) {
        canvas.removeEventListener("mousedown", startDrawing);
        canvas.removeEventListener("mousemove", draw);
        canvas.removeEventListener("mouseup", stopDrawing);
        canvas.removeEventListener("mouseleave", stopDrawing);
  
        // allow click through or remove completely
        canvas.style.pointerEvents = "none";
  
        // optional: remove canvas from DOM
        // canvas.remove();
  
        canvasRef.current = null;
        ctxRef.current = null;
      }
    };
  }, []);
  const handleBrushClick = () => {
    if (canvasRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.zIndex = "9999";
    canvas.style.pointerEvents = "auto";

    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.lineCap = "round";
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
      ctxRef.current = ctx;
    }

    canvasRef.current = canvas;

    // attach events
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseleave", stopDrawing);
  };

  const handleUndo = () => {
    if (!canvasRef.current || !ctxRef.current || history.length === 0) return;

    const newHistory = [...history];
    newHistory.pop();
    setHistory(newHistory);

    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (newHistory.length === 0) return;

    const img = new Image();
    img.src = newHistory[newHistory.length - 1];

    img.onload = () => {
      ctx.drawImage(img, 0, 0);
    };
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setBrushColor(color);

    if (ctxRef.current) ctxRef.current.strokeStyle = color;
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = parseInt(e.target.value, 10);
    setBrushSize(size);

    if (ctxRef.current) ctxRef.current.lineWidth = size;
  };

  return (
    <div>
      <button onClick={handleBrushClick}>Brush</button>
      <button onClick={handleUndo}>Undo</button>

      <input type="color" value={brushColor} onChange={handleColorChange} />

      <input
        type="range"
        min="1"
        max="50"
        value={brushSize}
        onChange={handleSizeChange}
      />
    </div>
  );
};







const Comments: React.FC = () => {
  const zIndexCounter = useRef<number>(1000);

  const addComment = (): void => {
    const div = document.createElement("div");
  
    div.className = "draggable-comment";
    div.contentEditable = "true";
    div.innerText = "💬 Add a comment...";
  
    // modern tag styling
    div.style.position = "absolute";
    div.style.top = "100px";
    div.style.left = "100px";
    div.style.padding = "12px 16px";
    div.style.background = "#ffffff";
    div.style.border = "1px solid #e5e7eb";
    div.style.borderRadius = "12px";
    div.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)";
    div.style.fontSize = "14px";
    div.style.fontFamily = "system-ui, sans-serif";
    div.style.color = "#111827";
    div.style.minWidth = "120px";
    div.style.maxWidth = "220px";
    div.style.cursor = "move";
    div.style.outline = "none";
    div.style.transition = "box-shadow 0.2s ease";
  
    // focus effect
    div.addEventListener("focus", () => {
      div.style.boxShadow = "0 10px 25px rgba(0,0,0,0.15)";
      div.style.border = "1px solid #6366f1";
    });
  
    div.addEventListener("blur", () => {
      div.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)";
      div.style.border = "1px solid #e5e7eb";
    });
  
    // hover effect
    div.addEventListener("mouseenter", () => {
      div.style.boxShadow = "0 12px 28px rgba(0,0,0,0.12)";
    });
  
    div.addEventListener("mouseleave", () => {
      div.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)";
    });
  
    div.style.zIndex = String(zIndexCounter.current++);
  
    document.body.appendChild(div);
  
    makeDraggable(div);
  };

  const makeDraggable = (element: HTMLElement): void => {
    interact(element).draggable({
      listeners: {
        move(event: Interact.DragEvent) {
          const target = event.target as HTMLElement;

          const x =
            (parseFloat(target.getAttribute("data-x") || "0")) + event.dx;
          const y =
            (parseFloat(target.getAttribute("data-y") || "0")) + event.dy;

          target.style.transform = `translate(${x}px, ${y}px)`;

          target.setAttribute("data-x", x.toString());
          target.setAttribute("data-y", y.toString());
        },
      },
    });

    // bring to front when clicked
    element.addEventListener("mousedown", () => {
      element.style.zIndex = String(zIndexCounter.current++);
    });
  };

  return (
    <div>
      <button onClick={addComment}>Add Comments</button>
    </div>
  );
};


const CSSFiltersPanel: React.FC<Pick<PanelProps, 'element' | 'setIsActive'>> = ({element, setIsActive}) => {

  return(
    <div>
      <ColorUI element={element} />
    </div>
  )
};



// --- Static panels (no props needed) ---
const ScreenshotPanel = () => <ScreenShot />;

const ColorPickerPanel = () => <FreeDraw />;
const FreeDrawPanel = () => <FreeDraw />;
const Comment = () => <Comments />;


// ============================================================
// Main VisualEditor
// ============================================================

interface ChildProps {
  element: HTMLElement | null;
  isDragging: boolean;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
  isDraggingRef: React.MutableRefObject<boolean>;
  setIsActive:React.Dispatch<React.SetStateAction<boolean>>;
  isActive:boolean;
}

const VisualEditor: React.FC<ChildProps> = ({
  element,
  isDragging,
  setIsDragging,
  isDraggingRef,
  setIsActive,
  isActive
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // ✅ useMemo rebuilds the LIST STRUCTURE (icons, titles, elementProps) when deps change,
  // but Element values point to STABLE hoisted components above — React never remounts them.
  const listsData: ListData[] = useMemo(
    () => [
      {
        title: 'Spacing',
        icon: <PanelRightDashed size={24} color="#3B9D55" />,
        Element: DimensionsPanel,
        elementProps: { element, isDragging, setIsDragging, isDraggingRef,setIsActive },
        tags:["width", "height", "dimensions",]
      },
      {
        title: 'Background',
        icon: <Wallpaper size={24} color="#3B9D55" />,
        Element: BackgroundPanel,
        elementProps: { element,setIsActive },
        tags:["bg", "background", "wallpaper",]
      },
      {
        title: 'Text',
        icon: <ALargeSmall size={24} color="#3B9D55" />,
        Element: TextPanel,
        elementProps: { element, isDragging, setIsDragging, isDraggingRef,setIsActive },
        tags:["text", "font",'typography']

      },
      {
        title: 'Screenshot',
        icon: <Camera size={24} color="#3B9D55" />,
        Element: ScreenshotPanel,
        elementProps: {},
        tags:["Screenshot", "Capture"]

      },
      {
        title: 'Change Theme',
        icon: <Box size={24} color="#3B9D55" />,
        Element: CSSFiltersPanel,
        elementProps: {element, setIsActive},
        tags:['Theme Change', 'Filters']
      },
      {
        title: 'Color Picker',
        icon: <Brush size={24} color="#3B9D55" />,
        Element: ColorPickerPanel,
        elementProps: {},
        tags:['color picker', 'eye dropper']
      },
      {
        title: 'Free Draw',
        icon: <PenTool size={24} color="#3B9D55" />,
        Element: FreeDrawPanel,
        elementProps: {},
        tags:['draw','pen tool', 'brush','pencil']
      },

      {
        title: 'Transform',
        icon: <Stone size={24} color="#3B9D55" />,
        Element: TransformPanel,
        elementProps: { element, isDragging, setIsDragging, isDraggingRef,setIsActive },
        tags:['transform', 'rotate', 'skew','3D']
      },
      {
        title: 'Shadow',
        icon: <Eclipse size={24} color="#3B9D55" />,
        Element: ShadowPanel,
        elementProps: { element, isDragging, setIsDragging, isDraggingRef,setIsActive },
        tags:['shadow','depth','light']
      },
      {
        title: 'Border',
        icon: <SquareRoundCorner size={18} color="#3B9D55" />,
        Element: BorderPanel,
        elementProps: { element, isDragging, setIsDragging, isDraggingRef,setIsActive },
        tags:['border', 'outline']
      },
      {
        title: 'Export Element',
        icon: <FileInput size={18} color="#3B9D55" />,
        Element: BorderPanel,
        elementProps: { element,setIsActive },
        tags:['border', 'outline']
      },  {
        title: 'CSS Inspector',
        icon: <SquareMousePointer size={18} color="#3B9D55" />,
        Element: BorderPanel,
        elementProps: { element },
        tags:['border', 'outline']
      },
      {
        title: 'Comments',
        icon: <Tag size={18} color="#3B9D55" />,
        Element: Comment,
        elementProps: { element },
        tags:['border', 'outline']
      },
      {
        title: 'Ask AI',
        icon: <MessageCircleQuestionMark size={18} color="#3B9D55" />,
        Element: AskAI,
        elementProps: { element,setIsActive },
        tags:['border', 'outline']
      },
    ],
    [element, isDragging, setIsDragging, isDraggingRef]
  );

  const styleH1: React.CSSProperties = {
  
    fontFamily: "'Inter', sans-serif",
    fontWeight: 'bold',
    fontSize: '30px',
    lineHeight: '29px',
    background: 'linear-gradient(74.36deg, #DFDFDF 25.33%, #808080 74.67%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    color: 'transparent',
  };

  // 3. Filter listsData before passing to SingleFocusLists:
const filteredLists = useMemo(() => {
  if (!searchQuery.trim()) return listsData;
  const q = searchQuery.toLowerCase();
  return listsData.filter(item =>
    item.title.toLowerCase().includes(q) ||
    item.tags?.some(tag => tag.toLowerCase().includes(q))
  );
}, [listsData, searchQuery]);


  return (
    <div>
      <div style={{display:'flex',height:'', justifyContent:'center', alignItems:'center', gap:'8px', width:'100%'}}>

      <Tippy content={<span style={{ color: "white", fontSize:'14px', borderRadius:'9px',fontWeight:'500', background:'#1b1b1b' , padding:'6px 10px'}}>Edit Mode</span>}   animation="fade"
  duration={[200, 150]}  placement="top" zIndex={9999}   appendTo={(ref) => {
    const root = ref.getRootNode();

    if (root instanceof ShadowRoot) {
      return root as unknown as Element; // 👈 safe cast for Tippy
    }

    return document.body;
  }}
      >
     <div>
     <Switch color={"#242424"}  checked={isActive} onChange={()=>{setIsActive(pre=>!pre)}} />
     </div>

   </Tippy>


<div style={styleH1}>
          webbit{' '}
    
        </div>



        <span
            style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#3B9D55',
              borderRadius: '50%',
              display: 'inline-block',
            }}
          />
      </div>

      <SearchBar query={searchQuery} onQueryChange={setSearchQuery} />

      <SingleFocusLists initialLists={filteredLists}  />
      </div>
  );
};

export default VisualEditor;