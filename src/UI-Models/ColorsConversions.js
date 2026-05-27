export const rgbaToRgb = (c) => c.replace(/,\s*[^,]+\)$/, ")");
export function rgbStringToHex(rgb) {
    const m = rgb.match(/\d+/g);
    if (!m || m.length < 3)
        return null;
    const [r, g, b] = m.map(Number);
    return `#${r.toString(16).padStart(2, "0")}${g
        .toString(16)
        .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
export function rgbToHsl(rgbString) {
    const matches = rgbString.match(/\d+/g);
    if (!matches || matches.length < 3) {
        throw new Error("Invalid RGB string");
    }
    const [r, g, b] = matches.map(Number);
    // Normalize to 0–1
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s =
            l > 0.5
                ? d / (2 - max - min)
                : d / (max + min);
        switch (max) {
            case rn:
                h = (gn - bn) / d + (gn < bn ? 6 : 0);
                break;
            case gn:
                h = (bn - rn) / d + 2;
                break;
            case bn:
                h = (rn - gn) / d + 4;
                break;
        }
        h /= 6;
    }
    const hue = Math.round(h * 360);
    const saturation = Math.round(s * 100);
    const lightness = Math.round(l * 100);
    return `hsl(${hue}, ${saturation}, ${lightness})`;
}
