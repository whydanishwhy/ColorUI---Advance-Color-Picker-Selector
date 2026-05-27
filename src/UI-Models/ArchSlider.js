import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useRef, useState } from "react";
export default function ArchSlider({ value, onChange, width = 180, height = 90, arc = 90, radius = 70, thickness = 8, knobSize = 10, trackColor = "rgba(255,255,255,.12)", progressColor = "#2a2a2a", knobColor = "#2a2a2a", knobInnerColor = "#2a2a2a", min = 0, max = 100, }) {
    const svgRef = useRef(null);
    const [dragging, setDragging] = useState(false);
    /** center moved inside box => no wasted area */
    const cx = width / 2;
    const cy = height + radius - 8;
    const startAngle = 180 + (180 - arc) / 2;
    const endAngle = 360 - (180 - arc) / 2;
    const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
    const percent = (value - min) / (max - min);
    function polar(centerX, centerY, r, angleDeg) {
        const rad = ((angleDeg - 90) * Math.PI) / 180;
        return {
            x: centerX + r * Math.cos(rad),
            y: centerY + r * Math.sin(rad),
        };
    }
    function arcPath(x, y, r, start, end) {
        const s = polar(x, y, r, end);
        const e = polar(x, y, r, start);
        const large = end - start <= 180 ? 0 : 1;
        return `
      M ${s.x} ${s.y}
      A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}
    `;
    }
    const track = useMemo(() => arcPath(cx, cy, radius, startAngle, endAngle), [cx, cy, radius, startAngle, endAngle]);
    const currentAngle = startAngle + percent * arc;
    const progress = useMemo(() => arcPath(cx, cy, radius, startAngle, currentAngle), [cx, cy, radius, startAngle, currentAngle]);
    const knob = polar(cx, cy, radius, currentAngle);
    function setFromPointer(clientX, clientY) {
        var _a;
        const rect = (_a = svgRef.current) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect();
        if (!rect)
            return;
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const dx = x - cx;
        const dy = y - cy;
        let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
        if (deg < 0)
            deg += 360;
        deg = clamp(deg, startAngle, endAngle);
        const p = (deg - startAngle) / arc;
        const next = min + p * (max - min);
        onChange(Math.round(next));
    }
    const down = (e) => {
        setDragging(true);
        setFromPointer(e.clientX, e.clientY);
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
    };
    const move = (e) => {
        setFromPointer(e.clientX, e.clientY);
    };
    const up = () => {
        setDragging(false);
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
    };
    const popupRef = useRef(null);
    const [open, setOpen] = useState(false);
    return (_jsx("div", { children: _jsxs("svg", { ref: svgRef, width: width, height: height, onPointerDown: down, style: {
                display: "block",
                overflow: "visible",
                cursor: "pointer",
                touchAction: "none",
                zIndex: 1,
                // background:'green'
            }, children: [_jsx("path", { d: track, fill: "none", stroke: trackColor, strokeWidth: thickness, strokeLinecap: "round" }), _jsx("path", { d: progress, fill: "none", stroke: progressColor, strokeWidth: thickness, strokeLinecap: "round" }), _jsxs("g", { transform: `translate(${knob.x},${knob.y}) scale(${dragging ? 1.08 : 1})`, style: {
                        transition: dragging
                            ? "none"
                            : "transform .08s linear",
                    }, children: [_jsx("circle", { r: knobSize, fill: knobColor }), _jsx("circle", { r: knobSize / 2.2, fill: knobInnerColor })] })] }) }));
}
