import React, { useEffect, useRef, useState } from "react";

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

export default function ParticleSpectrum() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const spreadRef = useRef(65);
  const intensityRef = useRef(75);

  const [spread, setSpread] = useState(65);
  const [intensity, setIntensity] = useState(75);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
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
    ========================== */

    const PARTICLE_COLOR = "#68eaff";

    const PARTICLE_COLOR_A = "#68eaff";
    const PARTICLE_COLOR_B = "#3E4E9B";

    function lerpColor(a: string, b: string, t: number) {
      const ah = parseInt(a.replace("#", ""), 16);
      const bh = parseInt(b.replace("#", ""), 16);

      const ar = ah >> 16,
        ag = (ah >> 8) & 0xff,
        ab = ah & 0xff;

      const br = bh >> 16,
        bg = (bh >> 8) & 0xff,
        bb = bh & 0xff;

      const rr = ar + (br - ar) * t;
      const rg = ag + (bg - ag) * t;
      const rb = ab + (bb - ab) * t;

      return `rgb(${rr | 0}, ${rg | 0}, ${rb | 0})`;
    }

    const getSpread = () => spreadRef.current;
    const getIntensity = () => intensityRef.current / 100;

    const BASE_SPEED = 1.3;

    const SOURCE_GLOW = true;
    const SOURCE_GLOW_POWER = 0.5;

    /* semi circle */
    const ARC_COLOR = "#242424";
    const ARC_THICKNESS = 0.5;
    const ARC_RADIUS = 180;

    /* dotted moving lines */
    const DOT_COLOR = "#242424";
    const DOT_THICKNESS = 0.5;
    const DOT_SPEED = 1.2;
    const DOT_COUNT = 14;
    const DOT_LINE_COUNT = 16;

    /* ========================== */

    const MAXP = 1800;

    const particles: Particle[] = new Array(MAXP);
    let count = 0;

    let animationId = 0;
    let time = 0;

    const rand = (a: number, b: number) =>
      a + Math.random() * (b - a);

    function emit() {
      if (count >= MAXP) return;

      const halfSpread = getSpread() * (Math.PI / 2);

      const angle =
        Math.PI / 2 -
        halfSpread +
        Math.random() * halfSpread * 2;

      const speed = rand(BASE_SPEED * 0.7, BASE_SPEED * 1.5);

      particles[count++] = {
        x: CX,
        y: CY,
        vx: Math.cos(angle) * speed,
        vy: -Math.sin(angle) * speed,
        life: 0,
        maxLife: rand(50, 120),
        wobAmp: rand(0.15, 0.7),
        wobFreq: rand(0.03, 0.07),
        wobOff: Math.random() * Math.PI * 2,
      };
    }

    for (let i = 0; i < 1000; i++) {
      emit();

      const p = particles[count - 1];
      if (!p) continue;

      const f = Math.random();

      p.life = p.maxLife * f;
      p.x += p.vx * p.life;
      p.y += p.vy * p.life;
    }

    /* ==========================
       DOT LINES (UNCHANGED)
    ========================== */

    function drawDottedLines() {
      ctx.fillStyle = DOT_COLOR;

      for (let i = 0; i < DOT_LINE_COUNT; i++) {
        const angle =
          Math.PI -
          (i / (DOT_LINE_COUNT - 1)) * Math.PI;

        const ex = CX + Math.cos(angle) * ARC_RADIUS;
        const ey = CY + Math.sin(angle) * ARC_RADIUS;

        const dx = ex - CX;
        const dy = ey - CY;

        for (let j = 0; j < DOT_COUNT; j++) {
          const t =
            (1 -
              (j / DOT_COUNT +
                time * 0.004 * DOT_SPEED)) %
            1;

          const x = CX + dx * t;
          const y = CY + dy * t;

          const alpha = 1 - t;

          ctx.globalAlpha = alpha;

          ctx.beginPath();
          ctx.arc(x, y, DOT_THICKNESS, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
    }

    /* ==========================
       PARTICLES (UPDATED ONLY HERE)
    ========================== */

    function drawParticles() {
      ctx.fillStyle = PARTICLE_COLOR;

      const spawn = Math.floor(3 + getIntensity() * 60);

      for (let i = 0; i < spawn; i++) {
        emit();
      }

      for (let i = 0; i < count; i++) {
        const p = particles[i];
        if (!p) continue;

        const alpha = 1 - p.life / p.maxLife;

        const wob =
          Math.sin(p.life * p.wobFreq + p.wobOff) *
          p.wobAmp;

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);

        const px = -p.vy / speed;
        const py = p.vx / speed;

        p.x += p.vx + px * wob;
        p.y += p.vy + py * wob;

        p.life++;

        /* ⭐ ONLY CHANGE: COLOR BLENDING */
        const t = (Math.sin(p.wobOff + p.life * 0.02) + 1) / 2;

        ctx.globalAlpha = alpha;
        ctx.fillStyle = lerpColor(
          PARTICLE_COLOR_A,
          PARTICLE_COLOR_B,
          t
        );

        ctx.fillRect(p.x, p.y, 1, 1);

        if (p.life >= p.maxLife) {
          particles[i] = particles[count - 1];
          count--;
          i--;
        }
      }

      ctx.globalAlpha = 1;
    }

    /* ==========================
       GLOW (UNCHANGED)
    ========================== */

    function drawSourceGlow() {
      if (!SOURCE_GLOW) return;

      const radius = 40 + SOURCE_GLOW_POWER * 40;

      const g = ctx.createRadialGradient(
        CX,
        CY,
        0,
        CX,
        CY,
        radius
      );

      g.addColorStop(
        0,
        `rgba(0,230,255,${SOURCE_GLOW_POWER})`
      );

      g.addColorStop(1, "transparent");

      ctx.beginPath();
      ctx.arc(CX, CY, radius, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    }

    /* ==========================
       SEMI CIRCLE
    ========================== */

    function drawSemiCircle() {
      ctx.beginPath();
      ctx.strokeStyle = ARC_COLOR;
      ctx.lineWidth = ARC_THICKNESS;
      ctx.arc(CX, CY, ARC_RADIUS, Math.PI, 0);
      ctx.stroke();
    }

    /* ==========================
       LOOP
    ========================== */

    function loop() {
      ctx.clearRect(0, 0, W, H);

      drawSourceGlow();
      drawDottedLines();
      drawParticles();
      drawSemiCircle();

      time++;

      animationId = requestAnimationFrame(loop);
    }

    loop();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div style={{ width: 270, padding: 20, fontFamily: "Arial" }}>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          display: "block",
          background: "transparent",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          marginTop: 18,
        }}
      >
        {/* Spread */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 80, color: "#7cecff", fontSize: 12 }}>
            Spread
          </span>

          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={spread}
            onChange={(e) => {
              const v = Number(e.target.value);
              setSpread(v);
              spreadRef.current = v;
            }}
            style={{ flex: 1 }}
          />

          <span style={{ width: 40, color: "#7cecff", textAlign: "right" }}>
            {spread}
          </span>
        </div>

        {/* Intensity */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 80, color: "#7cecff", fontSize: 12 }}>
            Intensity
          </span>

          <input
            type="range"
            min={1}
            max={100}
            value={intensity}
            onChange={(e) => {
              const v = Number(e.target.value);
              setIntensity(v);
              intensityRef.current = v;
            }}
            style={{ flex: 1 }}
          />

          <span style={{ width: 40, color: "#7cecff", textAlign: "right" }}>
            {intensity}
          </span>
        </div>
      </div>
    </div>
  );
}