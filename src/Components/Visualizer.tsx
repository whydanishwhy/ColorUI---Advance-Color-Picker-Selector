import React, { useMemo } from "react";
import { motion } from "framer-motion";


// ─────────────────────────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────────────────────────
type RGB = { r: number; g: number; b: number };
type HSL = { h: number; s: number; l: number };

type ColorToken = {
  hex: string;
  hsl: HSL;
  luminance: number;
  role: "bg" | "surface" | "accent" | "text" | "highlight";
};

type VisualizerTokens = {
  bg: ColorToken;
  surface: ColorToken;
  accent: ColorToken;
  text: ColorToken;
  highlight: ColorToken;
  bgText: string;         // readable text on bg
  accentText: string;     // readable text on accent
  surfaceText: string;    // readable text on surface
  gradStart: ColorToken;
  gradEnd: ColorToken;
};

type VisualizerProps = {
  colorPalette: string[];
};

// ─────────────────────────────────────────────────────────────────
//  COLOR MATH
// ─────────────────────────────────────────────────────────────────
function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const f = (v: number) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = luminance(hex1), l2 = luminance(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function readableOn(bgHex: string): string {
  return luminance(bgHex) > 0.35 ? "#0d0d0d" : "#f5f5f5";
}

function withAlpha(hex: string, alpha: number): string {
  // Returns hex color + alpha as rgba string
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─────────────────────────────────────────────────────────────────
//  SMART TOKEN ASSIGNMENT
//  Rules:
//   bg       = darkest or most-muted (lowest luminance)
//   surface  = second darkest (or second most muted)
//   accent   = most saturated — used for buttons, highlights
//   text     = highest contrast against bg
//   highlight= complements accent (remaining slot)
//   gradients use the two most hue-similar (cohesive) colors
// ─────────────────────────────────────────────────────────────────
function buildTokens(palette: string[]): VisualizerTokens | null {
  if (!palette || palette.length < 2) return null;

  // Clamp to max 5
  const colors = palette.slice(0, 5);

  const entries: ColorToken[] = colors.map((hex) => {
    const { r, g, b } = hexToRgb(hex);
    const hsl = rgbToHsl(r, g, b);
    return {
      hex,
      hsl,
      luminance: luminance(hex),
      role: "bg", // placeholder, overwritten below
    };
  });

  // Sort by luminance ascending
  const byLuminance = [...entries].sort((a, b) => a.luminance - b.luminance);
  // Sort by saturation descending
  const bySaturation = [...entries].sort((a, b) => b.hsl.s - a.hsl.s);

  const bg: ColorToken = { ...byLuminance[0], role: "bg" };

  // Surface = second darkest, but must differ enough from bg
  const surface: ColorToken = {
    ...(byLuminance[1] ?? byLuminance[0]),
    role: "surface",
  };

  // Accent = most saturated
  const accent: ColorToken = { ...bySaturation[0], role: "accent" };

  // Text accent = highest luminance (lightest) that contrasts bg well
  const textCandidate = byLuminance[byLuminance.length - 1];
  const text: ColorToken = { ...textCandidate, role: "text" };

  // Highlight = remaining slot (exclude already assigned)
  const usedHexes = new Set([bg.hex, surface.hex, accent.hex, text.hex]);
  const remaining = entries.filter((e) => !usedHexes.has(e.hex));
  const highlight: ColorToken =
    remaining.length > 0
      ? { ...remaining[0], role: "highlight" }
      : { ...accent, role: "highlight" };

  // Gradient pair = two most hue-similar colors (lowest hue distance)
  let gradStart = bg;
  let gradEnd = surface;
  let minHueDist = Infinity;
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const diff = Math.abs(entries[i].hsl.h - entries[j].hsl.h);
      const dist = Math.min(diff, 360 - diff);
      if (dist < minHueDist) {
        minHueDist = dist;
        gradStart = entries[i];
        gradEnd = entries[j];
      }
    }
  }

  // Contrasting gradient: if the two most cohesive are too similar in
  // luminance and we have more choices, prefer one dark + one mid
  const lumDiff = Math.abs(gradStart.luminance - gradEnd.luminance);
  if (lumDiff < 0.05 && entries.length >= 3) {
    gradStart = byLuminance[0];
    gradEnd = byLuminance[Math.floor(byLuminance.length / 2)];
  }

  return {
    bg,
    surface,
    accent,
    text,
    highlight,
    bgText: readableOn(bg.hex),
    accentText: readableOn(accent.hex),
    surfaceText: readableOn(surface.hex),
    gradStart,
    gradEnd,
  };
}

// ─────────────────────────────────────────────────────────────────
//  ABSTRACT SVG GRAPHIC  (right-side decorative element)
// ─────────────────────────────────────────────────────────────────
function AbstractGraphic({ tokens }: { tokens: VisualizerTokens }) {
  const { accent, highlight, surface, text, bg } = tokens;

  return (
    <svg
      viewBox="0 0 480 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <defs>
        {/* Glow filter */}
        <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Soft drop shadow */}
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="16"
            stdDeviation="24"
            floodColor={bg.hex}
            floodOpacity="0.55"
          />
        </filter>

        {/* Card gradient */}
        <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={surface.hex} />
          <stop offset="100%" stopColor={bg.hex} />
        </linearGradient>

        {/* Accent radial */}
        <radialGradient id="accentRadial" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent.hex} stopOpacity="0.9" />
          <stop offset="100%" stopColor={accent.hex} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background glow blob */}
      <ellipse
        cx="260"
        cy="240"
        rx="200"
        ry="180"
        fill={withAlpha(accent.hex, 0.12)}
      />

      {/* Main card */}
      <rect
        x="88"
        y="80"
        width="260"
        height="320"
        rx="24"
        fill="url(#cardGrad)"
        filter="url(#shadow)"
      />

      {/* Card top accent bar */}
      <rect x="88" y="80" width="260" height="72" rx="24" fill={accent.hex} />
      {/* Round off bottom of bar */}
      <rect x="88" y="128" width="260" height="24" fill={accent.hex} />

      {/* Avatar circle in top bar */}
      <circle cx="124" cy="116" r="22" fill={withAlpha(tokens.accentText, 0.15)} />
      <circle cx="124" cy="108" r="10" fill={withAlpha(tokens.accentText, 0.5)} />
      <ellipse cx="124" cy="130" rx="14" ry="8" fill={withAlpha(tokens.accentText, 0.35)} />

      {/* Name & role lines on top bar */}
      <rect x="156" y="106" width="96" height="9" rx="4.5" fill={withAlpha(tokens.accentText, 0.75)} />
      <rect x="156" y="120" width="64" height="7" rx="3.5" fill={withAlpha(tokens.accentText, 0.4)} />

      {/* Stat row */}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${100 + i * 82}, 172)`}>
          <rect width="66" height="44" rx="10" fill={withAlpha(highlight.hex, 0.18)} />
          <rect x="10" y="10" width="30" height="9" rx="4" fill={highlight.hex} opacity={0.8 - i * 0.12} />
          <rect x="10" y="26" width="46" height="7" rx="3" fill={withAlpha(tokens.surfaceText, 0.3)} />
        </g>
      ))}

      {/* Divider */}
      <line x1="108" y1="232" x2="328" y2="232" stroke={withAlpha(tokens.surfaceText, 0.1)} strokeWidth="1" />

      {/* Text lines block */}
      <rect x="108" y="248" width="176" height="9" rx="4" fill={withAlpha(tokens.surfaceText, 0.55)} />
      <rect x="108" y="264" width="136" height="8" rx="4" fill={withAlpha(tokens.surfaceText, 0.32)} />
      <rect x="108" y="279" width="156" height="8" rx="4" fill={withAlpha(tokens.surfaceText, 0.22)} />

      {/* CTA button on card */}
      <rect x="108" y="308" width="200" height="40" rx="12" fill={accent.hex} />
      <rect x="146" y="322" width="80" height="8" rx="4" fill={withAlpha(tokens.accentText, 0.8)} />
      <rect x="230" y="322" width="32" height="8" rx="4" fill={withAlpha(tokens.accentText, 0.4)} />
      {/* Arrow icon hint */}
      <path
        d={`M 285 326 L 292 326 M 289 322 L 294 326 L 289 330`}
        stroke={withAlpha(tokens.accentText, 0.7)}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Floating orbs */}
      <circle
        cx="358"
        cy="120"
        r="46"
        fill={highlight.hex}
        opacity="0.55"
        filter="url(#glow)"
      />
      <circle
        cx="370"
        cy="320"
        r="28"
        fill={text.hex}
        opacity="0.3"
        filter="url(#glow)"
      />
      <circle
        cx="72"
        cy="330"
        r="20"
        fill={accent.hex}
        opacity="0.45"
        filter="url(#glow)"
      />
      <circle
        cx="80"
        cy="140"
        r="12"
        fill={highlight.hex}
        opacity="0.4"
      />

      {/* Dot-grid decoration */}
      {Array.from({ length: 4 }, (_, row) =>
        Array.from({ length: 4 }, (_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={342 + col * 16}
            cy={200 + row * 16}
            r="2.5"
            fill={text.hex}
            opacity={0.1 + (row + col) * 0.025}
          />
        ))
      )}

      {/* Decorative arc */}
      <path
        d="M 55 400 Q 220 310 400 390"
        stroke={withAlpha(accent.hex, 0.3)}
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="5 9"
      />
      <path
        d="M 40 200 Q 68 110 148 76"
        stroke={withAlpha(text.hex, 0.18)}
        strokeWidth="1"
        fill="none"
        strokeDasharray="3 7"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
//  INLINE STYLES (no external CSS deps — matches your Generator style)
// ─────────────────────────────────────────────────────────────────
const S = {
  // Outer wrapper
  wrapper: (bg: string): React.CSSProperties => ({
    width: "700px",
    height: "400px",
    boxSizing: "border-box",
    position: "relative",
    overflow: "hidden",
    background: bg,
    display: "flex",
    alignItems: "stretch",
    flexShrink: 0,
    transition: "background 0.55s ease",
  }),

  // Ambient blobs
  blob: (
    color: string,
    size: number,
    top: string,
    left: string,
    blur: number,
    opacity: number
  ): React.CSSProperties => ({
    position: "absolute",
    borderRadius: "50%",
    width: size,
    height: size,
    top,
    left,
    background: color,
    filter: `blur(${blur}px)`,
    opacity,
    pointerEvents: "none",
    transition: "background 0.55s ease",
    zIndex: 0,
  }),

  // Subtle grid overlay
  gridOverlay: (): React.CSSProperties => ({
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.03) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
    pointerEvents: "none",
    zIndex: 1,
  }),

  // Left content column
  contentCol: (): React.CSSProperties => ({
    position: "relative",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "28px 24px 28px 32px",
    flex: "1 1 0",
    minWidth: 0,
  }),

  // Eyebrow
  eyebrow: (color: string): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "9px",
    fontWeight: 700,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color,
    marginBottom: "10px",
    transition: "color 0.5s ease",
  }),

  eyebrowLine: (color: string): React.CSSProperties => ({
    width: "28px",
    height: "2px",
    background: color,
    borderRadius: "2px",
    flexShrink: 0,
    transition: "background 0.5s ease",
  }),

  // H1
  h1: (color: string): React.CSSProperties => ({
    fontFamily: "'Georgia', serif",
    fontSize: "22px",
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: "-0.8px",
    color,
    margin: "0 0 10px 0",
    transition: "color 0.5s ease",
  }),

  // Paragraph
  p: (color: string): React.CSSProperties => ({
    fontSize: "12px",
    lineHeight: 1.6,
    color,
    maxWidth: "320px",
    margin: "0 0 18px 0",
    transition: "color 0.5s ease",
  }),

  // Button row
  btnRow: (): React.CSSProperties => ({
    display: "flex",
    gap: "14px",
    flexWrap: "wrap",
    alignItems: "center",
  }),

  // Primary button
  btnPrimary: (bg: string, color: string): React.CSSProperties => ({
    padding: "8px 16px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: 700,
    fontFamily: "inherit",
    cursor: "pointer",
    border: "none",
    background: bg,
    color,
    letterSpacing: "0.01em",
    boxShadow: `0 4px 16px ${withAlpha(bg, 0.45)}`,
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "background 0.5s ease, color 0.5s ease, box-shadow 0.5s ease",
  }),

  // Secondary button
  btnSecondary: (borderColor: string, color: string): React.CSSProperties => ({
    padding: "7px 14px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: 600,
    fontFamily: "inherit",
    cursor: "pointer",
    background: "transparent",
    border: `1.5px solid ${withAlpha(borderColor, 0.45)}`,
    color,
    letterSpacing: "0.01em",
    transition: "border-color 0.5s ease, color 0.5s ease",
  }),

  // Palette pill row at the bottom
  pillRow: (): React.CSSProperties => ({
    display: "flex",
    gap: "5px",
    marginTop: "16px",
    flexWrap: "wrap",
  }),

  pill: (bg: string, color: string): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: "5px",
    padding: "3px 8px 3px 6px",
    borderRadius: "20px",
    border: `1px solid ${withAlpha(color, 0.15)}`,
    fontSize: "9px",
    fontFamily: "'Courier New', monospace",
    fontWeight: 500,
    color,
    transition: "background 0.5s ease",
  }),

  pillDot: (bg: string): React.CSSProperties => ({
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: bg,
    flexShrink: 0,
    border: `1px solid ${withAlpha(bg, 0.3)}`,
  }),

  // Right graphic column
  graphicCol: (): React.CSSProperties => ({
    position: "relative",
    zIndex: 2,
    flex: "0 0 220px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px 20px 20px 0",
  }),

  // Empty state
  empty: (): React.CSSProperties => ({
    width: "100%",
    minHeight: "240px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#888",
    fontSize: "14px",
    fontFamily: "inherit",
    letterSpacing: "0.05em",
    border: "1px dashed #333",
    boxSizing: "border-box",
  }),
};

// ─────────────────────────────────────────────────────────────────
//  VISUALIZER COMPONENT
// ─────────────────────────────────────────────────────────────────
const Visualizer: React.FC<VisualizerProps> = ({ colorPalette }) => {
  const tokens = useMemo(
    () => buildTokens(colorPalette),
    [colorPalette]
  );

  // Not enough colors yet
  if (!tokens) {
    return (
      <div style={S.empty()}>
        Generate a palette to preview your design
      </div>
    );
  }

  const {
    bg,
    surface,
    accent,
    text,
    highlight,
    bgText,
    accentText,
    gradStart,
    gradEnd,
  } = tokens;

  // Background gradient uses the two most cohesive (hue-similar) colors
  const heroBg = `linear-gradient(135deg, ${gradStart.hex} 0%, ${gradEnd.hex} 100%)`;

  // Eyebrow + heading text: ensure contrast against the gradStart side
  const headingColor = readableOn(gradStart.hex);
  // Muted text = same hue but 60% opacity
  const mutedText = withAlpha(headingColor, 0.65);

  // Pick accent for eyebrow/CTA — must contrast gradStart
  const eyebrowColor =
    contrastRatio(accent.hex, gradStart.hex) > 2.5
      ? accent.hex
      : highlight.hex;

  return (
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

    transition={{
      duration: 0.6,
      delay: 0.4,
      ease: "easeOut",
    }}
    
    
    style={{ width: "700px", boxSizing: "border-box" }}>
      {/* ── HERO WRAPPER ─────────────────────────────────── */}
      <div
        style={{
          ...S.wrapper(heroBg),
          background: heroBg,
        }}
      >
        {/* Ambient light blobs */}
        <div style={S.blob(accent.hex, 480, "-140px", "-100px", 90, 0.38)} />
        <div style={S.blob(highlight.hex, 380, "auto", "auto", 80, 0.32)}
          // bottom-right
          // can't use bottom/right with the helper easily, so override:
        />
        <div
          style={{
            ...S.blob(surface.hex, 300, "40%", "32%", 70, 0.28),
          }}
        />

        {/* Grid overlay */}
        <div style={S.gridOverlay()} />

        {/* ── LEFT: CONTENT ─────────────────────────────── */}
        <div style={S.contentCol()}>
          {/* Eyebrow */}
          <div style={S.eyebrow(eyebrowColor)}>
            <span style={S.eyebrowLine(eyebrowColor)} />
            Design with purpose
          </div>

          {/* H1 */}
          <h1 style={S.h1(headingColor)}>
            Colors that speak<br />before words do.
          </h1>

          {/* Paragraph */}
          <p style={S.p(mutedText)}>
            Every hue tells a story. This palette balances warmth and
            contrast — crafted so your brand feels cohesive across every
            surface it touches.
          </p>

          {/* Buttons */}
          <div style={S.btnRow()}>
            <button style={S.btnPrimary(accent.hex, accentText)}>
              Get started
              {/* Arrow SVG */}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>

            <button style={S.btnSecondary(headingColor, headingColor)}>
              View examples
            </button>
          </div>

          {/* Palette pills — live color reference */}
          <div style={S.pillRow()}>
            {colorPalette.map((hex) => (
              <div key={hex} style={S.pill(bg.hex, headingColor)}>
                <span style={S.pillDot(hex)} />
                {hex.toUpperCase()}
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: ABSTRACT GRAPHIC ───────────────────── */}
        <div style={S.graphicCol()}>
          <AbstractGraphic tokens={tokens} />
        </div>
      </div>
    </motion.div>
  );
};

export default Visualizer;