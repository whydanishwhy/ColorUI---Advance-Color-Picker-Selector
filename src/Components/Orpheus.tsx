import React, {
    useEffect,
    useRef,
    useState,
    memo
  } from "react";



type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  wobAmp: number;
  wobFreq: number;
  wobOff: number;
};
  import {
    ChevronDown,
    ChevronUp,
    SquareDashed,
  } from "lucide-react";
  import Tippy from "@tippyjs/react";
  import ParticleSpectrum from "../UI-Models/Particles";
  import {
    Volume2,
    Waves,
    SlidersHorizontal,
    AudioWaveform
  } from "lucide-react";
  import Switch from "../UI-Models/Switch";
  
  import { motion } from "framer-motion";
  
  type MediaNodes = {
    media: HTMLMediaElement;
    gainNode: GainNode;
    compressor: DynamicsCompressorNode;
    bassEQ: BiquadFilterNode;
    midEQ: BiquadFilterNode;
    trebleEQ: BiquadFilterNode;
    wetGain: GainNode;
    dryGain: GainNode;
  };
  
  const SmoothSlider = memo(
    ({
      label,
      value,
      min,
      max,
      step,
      onChange,
      color = "#68eaff"
    }: any) => {
      return (
        <div className="mb-5">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <span style={{fontSize:'16px'}} >
              {label}
            </span>
  
            <motion.div
              layout
        
            >
              {Number(value).toFixed(2)}
            </motion.div>
          </div>
  
          <div className="relative h-8 flex items-center">
            <div className="absolute w-full h-1 rounded-full bg-white/10" />
  
            <motion.div
              className="absolute h-1 rounded-full"
              style={{
                background: color,
                width: `${
                  ((value - min) / (max - min)) *
                  100
                }%`
              }}
            />
  
  <input
  type="range"
  min={min}
  max={max}
  step={step}
  value={value}
  onChange={(e) => onChange(parseFloat(e.target.value))}
  className="slider"
  style={{
    background: `linear-gradient(
      to right,
      #3e8e9b ${
        ((value - min) / (max - min)) * 100
      }%,
      rgba(255,255,255,.1) ${
        ((value - min) / (max - min)) * 100
      }%
    )`
  }}
/>
          </div>
        </div>
      );
    }
  );
  

  
  export default function AudioFX() {
    const ctxRef =
      useRef<AudioContext | null>(null);
  
    const mediaNodes = useRef<
      Map<HTMLMediaElement, MediaNodes>
    >(new Map());
  
    const enabledRef = useRef(true);
  
    const gainRef = useRef(1);
    const reverbRef = useRef(0);
    const speedRef = useRef(1);
  
    const [gain, setGain] = useState(0);
    const [reverb, setReverb] =
      useState(0);
  
    const [speed, setSpeed] = useState(1);
  
    const [enabled, setEnabled] =
      useState(true);
  
    const [eqEnabled, setEqEnabled] =
      useState(false);
  
    const [bass, setBass] = useState(0);
    const [mid, setMid] = useState(0);
    const [treble, setTreble] =
      useState(0);
  
    const createImpulse = (
      ctx: AudioContext,
      seconds = 2.5
    ) => {
      const rate = ctx.sampleRate;
  
      const length = rate * seconds;
  
      const impulse = ctx.createBuffer(
        2,
        length,
        rate
      );
  
      for (let ch = 0; ch < 2; ch++) {
        const data =
          impulse.getChannelData(ch);
  
        for (let i = 0; i < length; i++) {
          data[i] =
            (Math.random() * 2 - 1) *
            Math.pow(1 - i / length, 2);
        }
      }
  
      return impulse;
    };
  
    const updateMedia = (
      media: HTMLMediaElement
    ) => {
      const nodes =
        mediaNodes.current.get(media);
  
      if (!nodes) return;
  
      if (!enabledRef.current) {
        nodes.gainNode.gain.value = 1;
  
        nodes.wetGain.gain.value = 0;
  
        media.playbackRate = 1;
  
        return;
      }
  
      nodes.gainNode.gain.value =
        gainRef.current;
  
      nodes.wetGain.gain.value =
        reverbRef.current;
  
      nodes.bassEQ.gain.value =
        eqEnabled ? bass : 0;
  
      nodes.midEQ.gain.value =
        eqEnabled ? mid : 0;
  
      nodes.trebleEQ.gain.value =
        eqEnabled ? treble : 0;
  
      media.playbackRate =
        speedRef.current;
    };
  
    const updateAllMedia = () => {
      mediaNodes.current.forEach(
        (_, media) => updateMedia(media)
      );
    };
  
    const processMedia = (
      media: HTMLMediaElement
    ) => {
      if (!ctxRef.current) return;
  
      if (mediaNodes.current.has(media))
        return;
  
      try {
        const ctx = ctxRef.current;
  
        const source =
          ctx.createMediaElementSource(
            media
          );
  
        const gainNode =
          ctx.createGain();
  
        const compressor =
          ctx.createDynamicsCompressor();
  
        const bassEQ =
          ctx.createBiquadFilter();
  
        bassEQ.type = "lowshelf";
        bassEQ.frequency.value = 200;
  
        const midEQ =
          ctx.createBiquadFilter();
  
        midEQ.type = "peaking";
        midEQ.frequency.value = 1000;
  
        const trebleEQ =
          ctx.createBiquadFilter();
  
        trebleEQ.type = "highshelf";
        trebleEQ.frequency.value = 3000;
  
        const convolver =
          ctx.createConvolver();
  
        convolver.buffer =
          createImpulse(ctx);
  
        const wetGain =
          ctx.createGain();
  
        const dryGain =
          ctx.createGain();
  
        source.connect(gainNode);
  
        gainNode.connect(compressor);
  
        compressor.connect(bassEQ);
  
        bassEQ.connect(midEQ);
  
        midEQ.connect(trebleEQ);
  
        trebleEQ.connect(dryGain);
  
        dryGain.connect(ctx.destination);
  
        trebleEQ.connect(convolver);
  
        convolver.connect(wetGain);
  
        wetGain.connect(ctx.destination);
  
        mediaNodes.current.set(media, {
          media,
          gainNode,
          compressor,
          bassEQ,
          midEQ,
          trebleEQ,
          wetGain,
          dryGain
        });
  
        updateMedia(media);
      } catch {}
    };
  
    useEffect(() => {
      const AudioContextClass =
        window.AudioContext ||
        (window as any).webkitAudioContext;
  
      ctxRef.current =
        new AudioContextClass();
  
      const scan = () => {
        document
          .querySelectorAll(
            "audio, video"
          )
          .forEach((m) =>
            processMedia(
              m as HTMLMediaElement
            )
          );
      };
  
      scan();
  
      const observer =
        new MutationObserver(scan);
  
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
  
      return () => {
        observer.disconnect();
  
        ctxRef.current?.close();
      };
    }, []);
  
    useEffect(() => {
      enabledRef.current = enabled;
  
      gainRef.current = gain;
  
      reverbRef.current = reverb;
  
      speedRef.current = speed;
  
      updateAllMedia();
    }, [
      enabled,
      gain,
      reverb,
      speed,
      bass,
      mid,
      treble,
      eqEnabled
    ]);
  


    const [open, setOpen] =
    useState(false);

  const popupRef =
  useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(
          e.target as Node
        )
      )
        setOpen(false);
      
    };

    document.addEventListener(
      "mousedown",
      h
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        h
      );
  }, []);



  // Visualizer

  const canvasRef = useRef<HTMLCanvasElement | null>(null);


  const spreadRef =
  useRef(0);

const intensityRef =
  useRef(0);

const [spread, setSpread] =
  useState(65);

const [
  intensity,
  setIntensity
] = useState(75);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext(
      "2d"
    ) as CanvasRenderingContext2D;

    if (!ctx) return;

    /* ==========================
       CANVAS
    ========================== */

    const W = 270;
    const H = 270;

    canvas.width = W;
    canvas.height = H;

    const CX = W / 2;
    const CY = H - 25;

    /* ==========================
       VARIABLES
       (change these only)
    ========================== */

    const PARTICLE_COLOR =
      "#68eaff";

      const getSpread = () =>
        spreadRef.current
      
      const getIntensity = () =>
        intensityRef.current / 100;

    const BASE_SPEED = 1.3;

    const SOURCE_GLOW = true;

    const SOURCE_GLOW_POWER = 0.5;

    /* semi circle */

    const ARC_COLOR ="#242424";

    // const ARC_COLOR = "#5E5E5E";

    const ARC_THICKNESS = 0.01;

    const ARC_RADIUS = 180;

    /* dotted moving lines */

    const DOT_COLOR =
      "#242424";

    const DOT_THICKNESS = 0.8;

    const DOT_SPEED = 1.2;

    const DOT_COUNT = 14;

    const DOT_LINE_COUNT = 16;

    /* ========================== */

    const MAXP = 1800;

    const particles: Particle[] =
      new Array(MAXP);

    let count = 0;

    let animationId = 0;

    let time = 0;

    const rand = (
      a: number,
      b: number
    ) =>
      a +
      Math.random() * (b - a);

    function emit() {
      if (count >= MAXP)
        return;

      const halfSpread =
      getSpread() *
      (Math.PI / 2);

      const angle =
        Math.PI / 2 -
        halfSpread +
        Math.random() *
          halfSpread *
          2;

      const speed =
        rand(
          BASE_SPEED * 0.7,
          BASE_SPEED * 1.5
        );

      particles[count++] = {
        x: CX,
        y: CY,

        vx:
          Math.cos(
            angle
          ) * speed,

        vy:
          -Math.sin(
            angle
          ) * speed,

        life: 0,

        maxLife:
          rand(
            50,
            120
          ),

        wobAmp:
          rand(
            .15,
            .7
          ),

        wobFreq:
          rand(
            .03,
            .07
          ),

        wobOff:
          Math.random() *
          Math.PI *
          2,
      };
    }

    for (
      let i = 0;
      i < 1000;
      i++
    ) {
      emit();

      const p =
        particles[
          count - 1
        ];

      if (!p)
        continue;

      const f =
        Math.random();

      p.life =
        p.maxLife * f;

      p.x +=
        p.vx *
        p.life;

      p.y +=
        p.vy *
        p.life;
    }

    function drawDottedLines() {
        ctx.fillStyle =
          DOT_COLOR;
      
        for (
          let i = 0;
          i <
          DOT_LINE_COUNT;
          i++
        ) {
          /* create rays only
             inside upper semicircle
          */
      
          const angle =
            Math.PI -
            (
              i /
              (DOT_LINE_COUNT - 1)
            ) *
            Math.PI;
      
          const ex =
            CX +
            Math.cos(
              angle
            ) *
            ARC_RADIUS;
      
          const ey =
            CY +
            Math.sin(
              angle
            ) *
            ARC_RADIUS;
      
          const dx =
            ex - CX;
      
          const dy =
            ey - CY;
      
          for (
            let j = 0;
            j < DOT_COUNT;
            j++
          ) {
            /* reverse movement:
               center → outward
            */
      
            const t =
              (
                1 -
                (
                  j /
                    DOT_COUNT +
                  time *
                    0.004 *
                    DOT_SPEED
                )
              ) % 1;
      
            const x =
              CX +
              dx * t;
      
            const y =
              CY +
              dy * t;
      
            const alpha =
              1 - t;
      
            ctx.globalAlpha =
              alpha;
      
            ctx.beginPath();
      
            ctx.arc(
              x,
              y,
              DOT_THICKNESS,
              0,
              Math.PI * 2
            );
      
            ctx.fill();
          }
        }
      
        ctx.globalAlpha = 1;
      }

    function drawParticles() {
      ctx.fillStyle =
        PARTICLE_COLOR;

      const spawn =
  Math.floor(
    3 +
    getIntensity() *
    60
  );

      for (
        let i = 0;
        i < spawn;
        i++
      ) {
        emit();
      }

      for (
        let i = 0;
        i < count;
        i++
      ) {
        const p =
          particles[i];

        if (!p)
          continue;

        const alpha =
          1 -
          p.life /
            p.maxLife;

        const wob =
          Math.sin(
            p.life *
              p.wobFreq +
              p.wobOff
          ) *
          p.wobAmp;

        const speed =
          Math.sqrt(
            p.vx *
              p.vx +
              p.vy *
                p.vy
          );

        const px =
          -p.vy /
          speed;

        const py =
          p.vx /
          speed;

        p.x +=
          p.vx +
          px *
            wob;

        p.y +=
          p.vy +
          py *
            wob;

        p.life++;

        ctx.globalAlpha =
          alpha;

        ctx.fillRect(
          p.x,
          p.y,
          1,
          1
        );

        if (
          p.life >=
          p.maxLife
        ) {
          particles[
            i
          ] =
            particles[
              count -
                1
            ];

          count--;

          i--;
        }
      }

      ctx.globalAlpha = 1;
    }

    function drawSourceGlow() {
      if (
        !SOURCE_GLOW
      )
        return;

      const radius =
        40 +
        SOURCE_GLOW_POWER *
          40;

      const g =
        ctx.createRadialGradient(
          CX,
          CY,
          0,
          CX,
          CY,
          radius
        );

      g.addColorStop(
        0,
        `rgba(
          0,
          230,
          255,
          ${
            SOURCE_GLOW_POWER
          }
        )`
      );

      g.addColorStop(
        1,
        "transparent"
      );

      ctx.beginPath();

      ctx.arc(
        CX,
        CY,
        radius,
        0,
        Math.PI *
          2
      );

      ctx.fillStyle =
        g;

      ctx.fill();
    }

    function drawSemiCircle() {
      ctx.beginPath();

      ctx.strokeStyle =
        ARC_COLOR;

      ctx.lineWidth =
        ARC_THICKNESS;

      ctx.arc(
        CX,
        CY,
        ARC_RADIUS,
        Math.PI,
        0
      );

      ctx.stroke();
    }

    function loop() {
      ctx.clearRect(
        0,
        0,
        W,
        H
      );

      drawSourceGlow();

      drawDottedLines();

      drawParticles();

      drawSemiCircle();

      time++;

      animationId =
        requestAnimationFrame(
          loop
        );
    }

    loop();

    return () =>
      cancelAnimationFrame(
        animationId
      );
  }, []);
  // End
    return (
      <>
        <style>{`
.slider{
  width:100%;
  appearance:none;
  -webkit-appearance:none;
  height:3px;
  border-radius:999px;
  outline:none;
  cursor:pointer;
  transition:.3s;
}


.slider::-webkit-slider-thumb{
  appearance:none;
  -webkit-appearance:none;
  width:22px;
  height:22px;
  border-radius:50%;
  background:#191919;
  border:5px solid #3e8e9b;

  box-shadow:
  0 4px 12px rgba(0,0,0,.3),
  0 0 15px rgba(62,142,155,.5);

  transition:.2s;
}

.slider::-webkit-slider-thumb:hover{
  transform:scale(1.2);
}

.slider::-webkit-slider-thumb:active{
  transform:scale(1.35);
}

.slider::-moz-range-thumb{
  width:22px;
  height:22px;
  border:none;
  border-radius:50%;
  background:#191919;
}
        
     
  
        `}</style>

{/* <ParticleSpectrum /> */}
  
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
            scale: 0.96
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1
          }}

          style={{color:'#837F7F', position:'relative', minHeight:
            '300px',
          }}
         
        >
            <div style={{display:'flex',zIndex:5, justifyContent:'center', gap:'4px', alignItems:'center'}}>
              <AudioWaveform className="text-violet-300" />
              <h1 className="text-lg font-semibold text-white">
                Audio FX
              </h1>
  
            </div>
  




  {/* Visualizer */}
            <div
      style={{
        width: 270,
        padding: 20,
        
        fontFamily:

          "Arial",
          marginTop:'-106px',
          marginLeft:'16px',
          zIndex:1
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          display: "block",
          background:
            "transparent",
        }}
      />
  
     
    </div>
      
  


  {/* End */}
          <span style={{
            position:'absolute',
            top:'-28px',
            left:'15px',
            zIndex:6
          }}><Switch
            checked={enabled}
            onChange={setEnabled}
            color={"#3e8e9b"}
            
          /></span>
  
         <div style={{padding:'19px 44px', display:'flex', flexDirection:'column', gap:'28px',}}>
         <SmoothSlider
            label="Gain"
            value={gain}
            min={0}
            max={100}
            step={0.01}
            // onChange={setGain}

            onChange={(v: number) => {
              setGain(v);
              setIntensity(v);
              intensityRef.current = v; 
            }}
            color="#8b5cf6"
          />
  
          <SmoothSlider
            label="Reverb"
            value={reverb}
            min={0}
            max={1}
            step={0.01}
            onChange={(v:number)=>{
              setReverb(v)
              setSpread(v);
  
              spreadRef.current =
                v;

            }}
            color="#06b6d4"
          />
{/*   
          <SmoothSlider
            label="Speed"
            value={speed}
            min={0.25}
            max={3}
            step={0.01}
            onChange={setSpeed}
            color="#22c55e"
          /> */}
         </div>
  
      
          




           {/* POPUP */}
      <div
        ref={popupRef}
        style={{
          position: "fixed",
          bottom: "17px",
          right: "47%",
          zIndex: 2147483645,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        {open && (
          <div
            onMouseDown={(e) =>
              e.stopPropagation()
            }
            style={{
              position: "fixed",
              bottom: "76px",
              right: "30px",
              width: "270px",
              minHeight:'120px',
              background:
                "#161616",
              borderRadius:
                "18px",
              padding: "14px",
              border:
                "1px solid rgba(255,255,255,0.07)",
              boxShadow:
                "0 24px 60px rgba(0,0,0,0.7)",
              display: "flex",
              flexDirection:
                "column",
              gap: "14px",
              animation:"ss-popIn .22s cubic-bezier(0.34,1.56,0.64,1)",
               transformOrigin:"top",
            }}
          >

<div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
  <div>Equalizer</div>
<Switch
            checked={eqEnabled}
            onChange={setEqEnabled}
            color={"#6366f1"}
          />
</div>
  
          {eqEnabled && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0
              }}
              animate={{
                opacity: 1,
                height: "auto"
              }}
            >
              <SmoothSlider
                label="Bass"
                value={bass}
                min={-20}
                max={20}
                step={0.1}
                onChange={setBass}
                color="#f59e0b"
              />
  
              <SmoothSlider
                label="Mid"
                value={mid}
                min={-20}
                max={20}
                step={0.1}
                onChange={setMid}
                color="#ef4444"
              />
  
              <SmoothSlider
                label="Treble"
                value={treble}
                min={-20}
                max={20}
                step={0.1}
                onChange={setTreble}
                color="#3b82f6"
              />
            </motion.div>
          )} 

          <button
          onClick={()=>{}}
          style={{background:'#483ECA', cursor:'pointer', borderRadius:'7px',color:'white', padding:'8px 16px', border:'none'}}
          >
            Upload Audio
          </button>

           


          </div>
        )}

        {/* FAB */}
        <div
          style={{
            display: "flex",
            justifyContent:
              "flex-end",
          }}
        >
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
          }}>More...</span>}   
          
          animation="shift-away-subtle"
          duration={[160, 110]}
          delay={[120, 0]}
          placement="top"
          offset={[10, 10]}
   zIndex={9999}   appendTo={(ref) => {
            const root = ref.getRootNode();
         
            if (root instanceof ShadowRoot) {
              return root as unknown as Element; // 👈 safe cast for Tippy
            }
         
            return document.body;
          }}
         >
         <div
          onMouseEnter={(e) => {
            // e.currentTarget.style.background = "#222";
            e.currentTarget.style.transform = "scale(1.06)";
            e.currentTarget.style.boxShadow =
              "0 8px 20px rgba(0,0,0,.25)";
          }}
          onMouseLeave={(e) => {
            // e.currentTarget.style.background = "#1a1a1a";
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow =
              "0 3px 10px rgba(0,0,0,.18)";
          }}
            onMouseDown={(e) =>
              e.stopPropagation()
            }
            onClick={() =>
              setOpen(
                (
                  p
                ) => !p
              )
            }
            style={{
              width: "30px",
              height: "30px",
              borderRadius:
                "50%",
              // background:
              //   "#191919",
              // border:
              //   "1px solid rgba(255,255,255,0.07)",
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              cursor:
                "pointer",
              color:
                "#777",
              // boxShadow:
              //   "0 4px 10px rgba(0,0,0,0.4)",
            }}
          >
            <ChevronUp
              size={13}
              style={{
                transition:
                  "transform 0.25s",
                transform:
                  open
                    ? "rotate(0deg)"
                    : "rotate(180deg)",
              }}
            />
          </div>
         </Tippy>
        </div>
      </div>
        </motion.div>
      </>
    );
  }