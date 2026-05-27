import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import Home from "../Components/Home";
import interact from 'interactjs';
const ColorUI = ({ element }) => {
    const [selectArea, setSelectArea] = useState(false);
    const [area, setArea] = useState(null);
    const [isMoveEnabled, setIsMoveEnabled] = useState(true);
    const [active, setActive] = useState("Home");
    const drawnDivRef = useRef(null);
    const overlayRef = useRef(null);
    const startPosRef = useRef(null);
    useEffect(() => {
        if (!selectArea)
            return;
        const overlay = document.createElement("div");
        overlay.style.cssText = `
          position: fixed;
          top:0; left:0; width:100vw; height:100vh;
          background: transparent; z-index:9998; pointer-events:none;
        `;
        document.body.appendChild(overlay);
        overlayRef.current = overlay;
        document.body.style.cursor =
            "crosshair";
        const handleMouseDown = (e) => {
            e.preventDefault();
            if (e.target.closest("__EXT_HOST__"))
                return;
            startPosRef.current = { x: e.clientX + window.scrollX, y: e.clientY + window.scrollY };
            const div = document.createElement("div");
            div.style.cssText = `
            position: absolute; left:${startPosRef.current.x}px; top:${startPosRef.current.y}px;
            width:0; height:0; background:rgba(80 146 255,0.5);
            border:2px solid rgb(80 146 255); z-index:9999; pointer-events:none;
          `;
            document.body.appendChild(div);
            drawnDivRef.current = div;
            div.id = "__CHROMA_LENS_SELECTED_AREA__";
        };
        const handleMouseMove = (e) => {
            e.preventDefault();
            if (!drawnDivRef.current || !startPosRef.current)
                return;
            const x = e.clientX + window.scrollX;
            const y = e.clientY + window.scrollY;
            let left = Math.min(startPosRef.current.x, x);
            let top = Math.min(startPosRef.current.y, y);
            let width = Math.abs(x - startPosRef.current.x);
            let height = Math.abs(y - startPosRef.current.y);
            Object.assign(drawnDivRef.current.style, {
                left: `${left}px`,
                top: `${top}px`,
                width: `${width}px`,
                height: `${height}px`,
            });
        };
        // In handleMouseUp, after creating the drawn div and setting area:
        const handleMouseUp = () => {
            if (!drawnDivRef.current)
                return;
            const rect = drawnDivRef.current.getBoundingClientRect();
            setArea({
                x: drawnDivRef.current.offsetLeft,
                y: Math.max(0, Math.min(rect.top, window.innerHeight)),
                w: drawnDivRef.current.offsetWidth,
                h: drawnDivRef.current.offsetHeight,
            });
            document.body.style.cursor =
                "";
            drawnDivRef.current.style.pointerEvents = "auto";
            // --- ADD CLOSE BUTTON ---
            const closeBtn = document.createElement("button");
            closeBtn.textContent = "×";
            closeBtn.style.cssText = `
    position: absolute;
    top: -12px;
    right: -12px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: none;
    background: rgb(80, 146, 255);
    color: white;
    font-size: 16px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 0;
  `;
            closeBtn.addEventListener("click", (e) => {
                var _a;
                e.stopPropagation();
                (_a = drawnDivRef.current) === null || _a === void 0 ? void 0 : _a.remove();
                drawnDivRef.current = null;
                setArea(null);
            });
            drawnDivRef.current.appendChild(closeBtn);
            // --- END CLOSE BUTTON ---
            const host = document.getElementById("__EXT_HOST__");
            if (host) {
                host.style.display = 'block';
            }
            setSelectArea(false);
            overlay.remove();
            overlayRef.current = null;
            startPosRef.current = null;
        };
        document.addEventListener("mousedown", handleMouseDown);
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        return () => {
            document.removeEventListener("mousedown", handleMouseDown);
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            overlay.remove();
        };
    }, [selectArea]);
    useEffect(() => {
        if (!drawnDivRef.current)
            return;
        interact(drawnDivRef.current)
            .draggable({
            listeners: {
                move(event) {
                    if (!isMoveEnabled)
                        return;
                    const target = event.target;
                    const x = (parseFloat(target.dataset.x) || 0) + event.dx;
                    const y = (parseFloat(target.dataset.y) || 0) + event.dy;
                    target.style.transform = `translate(${x}px, ${y}px)`;
                    target.dataset.x = `${x}`;
                    target.dataset.y = `${y}`;
                    const rect = target.getBoundingClientRect();
                    setArea({ x: rect.left, y: rect.top, w: rect.width, h: rect.height });
                },
            },
        })
            .resizable({
            edges: { right: true, bottom: true, left: true, top: true }, // ← all 4 sides
            listeners: {
                move(event) {
                    const target = event.target;
                    target.style.width = `${event.rect.width}px`;
                    target.style.height = `${event.rect.height}px`;
                    // Also update position for top/left resize
                    const x = (parseFloat(target.dataset.x) || 0) + event.deltaRect.left;
                    const y = (parseFloat(target.dataset.y) || 0) + event.deltaRect.top;
                    target.style.transform = `translate(${x}px, ${y}px)`;
                    target.dataset.x = `${x}`;
                    target.dataset.y = `${y}`;
                    const rect = target.getBoundingClientRect();
                    setArea({ x: rect.left, y: rect.top, w: rect.width, h: rect.height });
                },
            },
        });
    }, [isMoveEnabled]);
    return (_jsxs("div", { children: [_jsx("div", { style: { width: '100%', display: "flex", flexDirection: "column", gap: ''
                }, children: _jsx(Home, { setSelectArea: setSelectArea }) }), " "] }));
};
export default ColorUI;
