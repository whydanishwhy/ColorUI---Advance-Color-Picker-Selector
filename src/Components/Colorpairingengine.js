// ─────────────────────────────────────────────
//  Color Pairing Engine
//  Foundation layer — rules are intentional and
//  easy to extend later.
// ─────────────────────────────────────────────
// ── Parsing ──────────────────────────────────
export function rgbaToHsl(input) {
    const m = input.trim().match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/);
    if (!m)
        return { h: 0, s: 0, l: 0 };
    let r = +m[1] / 255, g = +m[2] / 255, b = +m[3] / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h *= 60;
    }
    return { h: Math.round(h), s, l };
}
export function hslToString({ h, s, l }) {
    return `hsl(${Math.round((h + 360) % 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}
// ── Small RNG that can be seeded ──────────────
function rng(seed) {
    let s = seed;
    return () => {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        return (s >>> 0) / 0xffffffff;
    };
}
function jitter(rand, base, range) {
    return base + (rand() - 0.5) * 2 * range;
}
function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
}
function personality({ s, l }) {
    if (s < 0.08)
        return "neutral";
    if (s < 0.25)
        return "muted";
    if (l > 0.72)
        return "pastel";
    if (l < 0.28)
        return "dark";
    return "vivid";
}
const RULES = {
    // ── Analogous ──────────────────────────────
    // Neighbours on the wheel. Hues stay 15–40° apart.
    // S barely changes; L steps slightly to separate swatches.
    analogous: {
        hShift: (i, rand) => (i + 1) * jitter(rand, 22, 8),
        sDelta: (_i, rand, p) => {
            if (p === "neutral")
                return jitter(rand, 0, 0.04);
            if (p === "pastel")
                return jitter(rand, -0.04, 0.03);
            return jitter(rand, 0.03, 0.04);
        },
        lDelta: (i, rand, p) => {
            if (p === "dark")
                return jitter(rand, 0.06, 0.04) * (i % 2 === 0 ? 1 : -1);
            if (p === "pastel")
                return jitter(rand, -0.04, 0.03);
            return jitter(rand, 0, 0.05);
        },
    },
    // ── Analogous wide ─────────────────────────
    // Broader spread — 40–70°. More contrast between swatches.
    "analogous-wide": {
        hShift: (i, rand) => (i + 1) * jitter(rand, 52, 12),
        sDelta: (_i, rand, p) => {
            if (p === "muted" || p === "neutral")
                return jitter(rand, 0.05, 0.03);
            return jitter(rand, -0.02, 0.05);
        },
        lDelta: (i, rand, _p) => jitter(rand, 0, 0.06) * (i % 2 === 0 ? 1 : -1),
    },
    // ── Monochromatic ──────────────────────────
    // Hue is locked. S and L shift to create variation.
    // Rule: S stays within ±0.20 of base; L steps ±0.10–0.20 each.
    monochromatic: {
        hShift: (_i, _rand) => 0,
        sDelta: (i, rand, p) => {
            if (p === "neutral")
                return jitter(rand, 0, 0.02);
            // alternate above / below in S
            const dir = i % 2 === 0 ? 1 : -1;
            return dir * jitter(rand, 0.08, 0.05);
        },
        lDelta: (i, rand, p) => {
            // strong L ladder so swatches are clearly distinct
            const base = 0.12 + i * 0.05;
            const dir = p === "dark" ? 1 : i % 2 === 0 ? -1 : 1;
            return dir * jitter(rand, base, 0.04);
        },
    },
    // ── Tonal ──────────────────────────────────
    // Like mono but L steps are more dramatic (±0.18–0.28).
    // Good for creating deep → light progressions.
    tonal: {
        hShift: (_i, rand) => jitter(rand, 0, 3), // tiny H drift
        sDelta: (_i, rand, p) => {
            if (p === "vivid")
                return jitter(rand, -0.06, 0.04);
            if (p === "dark")
                return jitter(rand, 0.08, 0.04);
            return jitter(rand, 0, 0.04);
        },
        lDelta: (i, rand, p) => {
            const step = 0.18 + i * 0.04;
            const dir = p === "dark" ? 1 : -1;
            return dir * jitter(rand, step, 0.04);
        },
    },
    // ── Neutral blend ──────────────────────────
    // Desaturate progressively toward a near-gray.
    // H may drift a little; S drops significantly each step.
    // Good for building grounded palettes with a hero color.
    "neutral-blend": {
        hShift: (_i, rand) => jitter(rand, 0, 8),
        sDelta: (i, rand, _p) => {
            // each step removes ~0.12–0.20 saturation
            return -(0.14 + i * 0.10) + jitter(rand, 0, 0.03);
        },
        lDelta: (i, rand, p) => {
            // push L toward 0.55 (mid-light) for neutrals
            const target = 0.55;
            const curr = p === "dark" ? 0.2 : p === "pastel" ? 0.8 : 0.5;
            const dist = (target - curr) * (0.3 + i * 0.2);
            return dist + jitter(rand, 0, 0.04);
        },
    },
    // ── Split complement ───────────────────────
    // Swatches jump ~140–160° away, alternating sides.
    // S is softened so the contrast doesn't clash.
    "split-complement": {
        hShift: (i, rand) => {
            const side = i % 2 === 0 ? 1 : -1;
            return side * jitter(rand, 150, 15);
        },
        sDelta: (_i, rand, p) => {
            if (p === "vivid")
                return jitter(rand, -0.12, 0.06);
            if (p === "muted")
                return jitter(rand, 0.06, 0.04);
            return jitter(rand, -0.05, 0.05);
        },
        lDelta: (_i, rand, _p) => jitter(rand, 0, 0.07),
    },
};
// ── Saturation clamping rules ─────────────────
// Per-personality hard limits so nothing goes gray or neon.
const S_LIMITS = {
    vivid: [0.35, 0.95],
    pastel: [0.15, 0.65],
    dark: [0.20, 0.90],
    muted: [0.08, 0.55],
    neutral: [0.00, 0.18],
};
const L_LIMITS = {
    vivid: [0.22, 0.78],
    pastel: [0.50, 0.92],
    dark: [0.08, 0.55],
    muted: [0.20, 0.80],
    neutral: [0.15, 0.88],
};
// ── Public API ────────────────────────────────
/**
 * Generate `count` pairing colors for a base color string.
 *
 * @param baseColor  - Any CSS color string parseable as rgba / rgb
 * @param mode       - Which rule set to use
 * @param seed       - Integer seed; same seed → same output
 * @param count      - How many colors to generate (default 4)
 */
export function generatePairings(baseColor, mode, seed, count = 4) {
    const base = rgbaToHsl(baseColor);
    const p = personality(base);
    const rule = RULES[mode];
    const rand = rng(seed);
    const [sLo, sHi] = S_LIMITS[p];
    const [lLo, lHi] = L_LIMITS[p];
    return Array.from({ length: count }, (_, i) => {
        const h = (base.h + rule.hShift(i, rand) + 360) % 360;
        const s = clamp(base.s + rule.sDelta(i, rand, p), sLo, sHi);
        const l = clamp(base.l + rule.lDelta(i, rand, p), lLo, lHi);
        return hslToString({ h, s, l });
    });
}
/**
 * Pick a mode automatically based on the base color's personality.
 * Used when "random" is selected so the result is never jarring.
 */
export function autoMode(baseColor) {
    const p = personality(rgbaToHsl(baseColor));
    const options = {
        vivid: ["analogous", "analogous-wide", "split-complement"],
        pastel: ["analogous", "monochromatic", "tonal"],
        dark: ["tonal", "monochromatic", "analogous"],
        muted: ["neutral-blend", "monochromatic", "analogous"],
        neutral: ["tonal", "neutral-blend", "monochromatic"],
    };
    const list = options[p];
    return list[Math.floor(Math.random() * list.length)];
}
