import { jsx as _jsx } from "react/jsx-runtime";
export default function ArchTextIcon({ text, icon, radius = 90, startAngle = -110, endAngle = 20, fontSize = 18, letterSpacing = 0, clockwise = true, color = '#111', gap = 12, className, style, }) {
    const chars = text.split('');
    const totalSlots = chars.length + (icon ? 1 : 0);
    const span = endAngle - startAngle;
    const step = totalSlots > 1 ? span / (totalSlots - 1) : 0;
    const dir = clockwise ? 1 : -1;
    const size = radius * 2 + fontSize * 3;
    const center = size / 2;
    const pointAt = (deg) => {
        const rad = (deg * Math.PI) / 180;
        return {
            x: center + Math.cos(rad) * radius,
            y: center + Math.sin(rad) * radius,
        };
    };
    const items = [];
    let slot = 0;
    if (icon) {
        const angle = startAngle;
        const p = pointAt(angle);
        items.push(_jsx("div", { style: { position: 'absolute', left: p.x, top: p.y, transform: `translate(-50%,-50%) rotate(${angle + 90 * dir}deg)`, color }, children: icon }, "icon"));
        slot += 1;
    }
    chars.forEach((ch, i) => {
        const angle = startAngle + (slot * step) + (icon ? gap : 0);
        const p = pointAt(angle);
        items.push(_jsx("span", { style: {
                position: 'absolute',
                left: p.x,
                top: p.y,
                transform: `translate(-50%,-50%) rotate(${angle + 90 * dir}deg)`,
                fontSize,
                letterSpacing,
                color,
                whiteSpace: 'pre'
            }, children: ch }, i));
        slot += 1;
    });
    return (_jsx("div", { className: className, style: Object.assign({ position: 'relative', width: size, height: size }, style), children: items }));
}
