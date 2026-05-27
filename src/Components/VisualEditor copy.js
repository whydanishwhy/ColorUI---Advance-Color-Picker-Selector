import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState, useRef } from 'react';
import SearchBar from '../UI-Models/SearchBar';
import ColorInput from '../UI-Models/ColorInput';
import DragNumberInput from '../UI-Models/DragNumberInput';
import { Box, Camera, ALargeSmall, Brush, PenTool, TextAlignStart, TextAlignJustify, TextAlignEnd, Wallpaper, Ban, MessageCircleQuestionMark, SquareRoundCorner, PanelRightDashed, Eclipse, FileInput, Stone, Tag, SquareMousePointer } from 'lucide-react';
import Tippy from '@tippyjs/react';
import ColorUI from './ColorUI';
import ScreenShot from './ScreenShot';
import interact from 'interactjs';
import Joystick3D from '../UI-Models/Joystick3D';
import InstructionSelectElement from './InstructionSelectElement';
import Switch from '../UI-Models/Switch';
import { SingleFocusLists } from './../UI-Models/SingleListItem';
import AskAI from './AskAI';
// --- Dimensions ---
const DimensionsPanel = ({ element, isDragging, setIsDragging, isDraggingRef, setIsActive }) => {
    const [setInstrcutionPage, setsetInstrcutionPage] = useState(true);
    const tabs = ["Padding", "Margin"];
    const [activeTab, setActiveTab] = useState("Padding");
    useEffect(() => {
        setIsActive(true);
        if (element) {
            setsetInstrcutionPage(false);
        }
        else {
            setsetInstrcutionPage(true);
        }
        return () => {
            setIsActive(false);
        };
    }, [element]);
    const TabHeader = () => (_jsx("div", { style: styles.tabBar, children: tabs.map((tab) => (_jsxs("div", { onClick: () => setActiveTab(tab), style: Object.assign(Object.assign({}, styles.tab), (activeTab === tab ? styles.activeTab : {})), children: [tab, activeTab === tab && _jsx("div", { style: styles.indicator })] }, tab))) }));
    return (_jsx("div", { children: setInstrcutionPage ? _jsx(InstructionSelectElement, {}) :
            _jsxs("div", { children: [_jsx(TabHeader, {}), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px' }, children: [activeTab === "Padding" && _jsxs("div", { style: { display: "grid",
                                    gridTemplateColumns: "repeat(2, 1fr)",
                                    gap: "8px", }, children: [_jsx(DragNumberInput, { isDragging: isDragging, setIsDragging: setIsDragging, isDraggingRef: isDraggingRef, element: element, property: "paddingTop", symbol: "T", label: "Top", min: 0, max: 2000, step: 1 }), _jsx(DragNumberInput, { isDragging: isDragging, setIsDragging: setIsDragging, isDraggingRef: isDraggingRef, element: element, property: "paddingLeft", symbol: "L", label: "Left", min: 0, max: 2000, step: 1 }), _jsx(DragNumberInput, { isDragging: isDragging, setIsDragging: setIsDragging, isDraggingRef: isDraggingRef, element: element, property: "paddingBottom", symbol: "B", label: "Bottom", min: 0, max: 2000, step: 1 }), _jsx(DragNumberInput, { isDragging: isDragging, setIsDragging: setIsDragging, isDraggingRef: isDraggingRef, element: element, property: "paddingRight", symbol: "R", label: "Right", min: 0, max: 2000, step: 1 })] }), activeTab === "Margin" && _jsxs("div", { style: { display: "grid",
                                    gridTemplateColumns: "repeat(2, 1fr)",
                                    gap: "8px", }, children: [_jsx(DragNumberInput, { isDragging: isDragging, setIsDragging: setIsDragging, isDraggingRef: isDraggingRef, element: element, property: "marginTop", symbol: "T", label: "Top", min: 0, max: 2000, step: 1 }), _jsx(DragNumberInput, { isDragging: isDragging, setIsDragging: setIsDragging, isDraggingRef: isDraggingRef, element: element, property: "marginLeft", symbol: "L", label: "Left", min: 0, max: 2000, step: 1 }), _jsx(DragNumberInput, { isDragging: isDragging, setIsDragging: setIsDragging, isDraggingRef: isDraggingRef, element: element, property: "marginBottom", symbol: "B", label: "Bottom", min: 0, max: 2000, step: 1 }), _jsx(DragNumberInput, { isDragging: isDragging, setIsDragging: setIsDragging, isDraggingRef: isDraggingRef, element: element, property: "marginRight", symbol: "R", label: "Right", min: 0, max: 2000, step: 1 })] })] })] }) }));
};
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
const styles = {
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
const tabs = ["solid", "linear", "radial", "image", "texture"];
const BackgroundPanel = ({ element, setIsActive }) => {
    const [instructionPage, setInstructionPage] = useState(true);
    const [activeTab, setActiveTab] = useState("solid");
    const [bgColor, setBgColor] = useState("");
    const [addColorToggle, setAddColorToggle] = useState(false);
    useEffect(() => {
        setIsActive(true);
        if (element)
            setInstructionPage(false);
        else
            setInstructionPage(true);
        return () => setIsActive(false);
    }, [element]);
    // =========================
    // TAB HEADER
    // =========================
    const TabHeader = () => (_jsx("div", { style: styles.tabBar, children: tabs.map((tab) => (_jsxs("div", { onClick: () => setActiveTab(tab), style: Object.assign(Object.assign({}, styles.tab), (activeTab === tab ? styles.activeTab : {})), children: [tab, activeTab === tab && _jsx("div", { style: styles.indicator })] }, tab))) }));
    // =========================
    // SOLID BACKGROUND
    // =========================
    const SolidPanel = () => {
        const [hovered, setHovered] = useState(null);
        return (_jsxs("div", { style: styles.panel, children: [_jsx(ColorInput, { element: element, mode: "backgroundColor", Bgcolor: bgColor }), _jsx("div", { style: styles.title, children: "Presets" }), _jsx("div", { style: styles.grid, children: PRESETS.map((grad) => grad === "transparent" ? (_jsx("div", { onClick: () => {
                            if (element)
                                element.style.background = grad;
                            setBgColor(grad);
                        }, onMouseEnter: () => setHovered(grad), onMouseLeave: () => setHovered(null), style: Object.assign(Object.assign({}, styles.circle), { display: "flex", alignItems: "center", justifyContent: "center", border: bgColor === grad ? "1px solid #fff" : "1px solid #555", cursor: "pointer", transform: hovered === grad ? "scale(1.1)" : "scale(1)", transition: "transform 0.2s ease" }), children: _jsx(Ban, { color: "red" }) }, grad)) : (_jsx("div", { onClick: () => {
                            if (element)
                                element.style.background = grad;
                            setBgColor(grad);
                        }, onMouseEnter: () => setHovered(grad), onMouseLeave: () => setHovered(null), style: Object.assign(Object.assign({}, styles.circle), { background: grad, border: bgColor === grad ? "1px solid #fff" : "1px solid transparent", boxShadow: bgColor === grad ? "0 0 0 2px rgba(0,0,0,0.2)" : "none", cursor: "pointer", transform: hovered === grad ? "scale(1.1)" : "scale(1)", transition: "transform 0.2s ease" }) }, grad))) })] }));
    };
    // =========================
    // PLACEHOLDER PANELS (ready for future)
    // =========================
    const LinearPanel = () => (_jsx("div", { style: styles.panel, children: "Linear Gradient Editor (Coming Soon)" }));
    const RadialPanel = () => (_jsx("div", { style: styles.panel, children: "Radial Gradient Editor (Coming Soon)" }));
    const ImagePanel = () => {
        const [bg, setBg] = useState({
            image: null, fit: "cover", posX: 50, posY: 50, scale: 100, repeat: false,
        });
        const [isDragging, setIsDragging] = useState(false);
        const [showHint, setShowHint] = useState(false);
        const [showBadge, setShowBadge] = useState(false);
        const fileRef = useRef(null);
        const canvasRef = useRef(null);
        const hintTimer = useRef(null);
        const badgeTimer = useRef(null);
        const drag = useRef({ startX: 0, startY: 0, startPosX: 50, startPosY: 50 });
        const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
        useEffect(() => {
            if (!element)
                return;
            const styles = getBgStyle(bg);
            Object.assign(element.style, {
                backgroundImage: styles.backgroundImage || "",
                backgroundSize: styles.backgroundSize || "",
                backgroundPosition: styles.backgroundPosition || "",
                backgroundRepeat: styles.backgroundRepeat || "",
            });
        }, [bg]);
        const getBgStyle = (s) => {
            if (!s.image)
                return {};
            return {
                backgroundImage: `url(${s.image})`,
                backgroundSize: s.fit === "auto" ? `${s.scale}%` : s.fit,
                backgroundPosition: `${Math.round(s.posX)}% ${Math.round(s.posY)}%`,
                backgroundRepeat: s.repeat ? "repeat" : "no-repeat",
            };
        };
        const handleFile = (e) => {
            var _a;
            const file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
            if (!file)
                return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                setBg((p) => { var _a; return (Object.assign(Object.assign({}, p), { image: (_a = ev.target) === null || _a === void 0 ? void 0 : _a.result })); });
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
            if (fileRef.current)
                fileRef.current.value = "";
        };
        const onPointerDown = (e) => {
            if (!bg.image)
                return;
            drag.current = { startX: e.clientX, startY: e.clientY, startPosX: bg.posX, startPosY: bg.posY };
            e.target.setPointerCapture(e.pointerId);
            setIsDragging(true);
            setShowHint(false);
            setShowBadge(true);
            e.preventDefault();
        };
        const onPointerMove = (e) => {
            if (!isDragging || !canvasRef.current)
                return;
            const rect = canvasRef.current.getBoundingClientRect();
            const dx = (e.clientX - drag.current.startX) / rect.width * 100;
            const dy = (e.clientY - drag.current.startY) / rect.height * 100;
            setBg((p) => (Object.assign(Object.assign({}, p), { posX: clamp(drag.current.startPosX - dx, 0, 100), posY: clamp(drag.current.startPosY - dy, 0, 100) })));
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
        const pill = { display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 999, border: "0.5px solid #ccc", background: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" };
        const toolLabel = { fontSize: 11, fontWeight: 500, color: "#999", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" };
        const fitBtn = (active) => ({ padding: "5px 10px", borderRadius: 6, border: `0.5px solid ${active ? "#555" : "#ddd"}`, background: active ? "#fff" : "#f5f5f5", fontSize: 12, fontWeight: active ? 500 : 400, color: active ? "#111" : "#666", cursor: "pointer" });
        return (_jsxs("div", { style: { display: "flex", flexDirection: "column", border: "0.5px solid #ddd", borderRadius: 12, overflow: "hidden", fontFamily: "sans-serif", maxWidth: 680 }, children: [_jsxs("div", { ref: canvasRef, style: Object.assign({ position: "relative", height: 260, background: "#f5f5f5", overflow: "hidden", cursor: s.image ? (isDragging ? "grabbing" : "grab") : "default" }, getBgStyle(s)), onPointerDown: onPointerDown, onPointerMove: onPointerMove, onPointerUp: onPointerUp, onPointerCancel: onPointerUp, children: [!s.image && (_jsxs("div", { style: { position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }, children: [_jsxs("svg", { width: "36", height: "36", viewBox: "0 0 24 24", fill: "none", stroke: "#bbb", strokeWidth: "1.2", children: [_jsx("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }), _jsx("circle", { cx: "8.5", cy: "8.5", r: "1.5" }), _jsx("polyline", { points: "21 15 16 10 5 21" })] }), _jsx("span", { style: { fontSize: 13, color: "#aaa" }, children: "No background set" }), _jsxs("label", { style: pill, children: [_jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [_jsx("path", { d: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" }), _jsx("polyline", { points: "17 8 12 3 7 8" }), _jsx("line", { x1: "12", y1: "3", x2: "12", y2: "15" })] }), "Upload image", _jsx("input", { ref: fileRef, type: "file", accept: "image/*", style: { display: "none" }, onChange: handleFile })] })] })), s.image && showHint && (_jsxs("div", { style: { position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, pointerEvents: "none", transition: "opacity 0.4s" }, children: [_jsxs("div", { style: { position: "relative", width: 52, height: 52 }, children: [[
                                            { cls: "up", style: { top: 0, left: "50%", transform: "translateX(-50%)" }, d: "M3,7 6,3 9,7" },
                                            { cls: "down", style: { bottom: 0, left: "50%", transform: "translateX(-50%)" }, d: "M3,3 6,7 9,3" },
                                            { cls: "left", style: { left: 0, top: "50%", transform: "translateY(-50%)" }, d: "M7,3 3,6 7,9" },
                                            { cls: "right", style: { right: 0, top: "50%", transform: "translateY(-50%)" }, d: "M3,3 7,6 3,9" },
                                        ].map(arm => (_jsx("div", { style: Object.assign({ position: "absolute", width: 20, height: 20, borderRadius: 4, border: "0.5px solid #ccc", background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center" }, arm.style), children: _jsx("svg", { width: "10", height: "10", viewBox: "0 0 10 10", children: _jsx("polyline", { points: arm.d, fill: "none", stroke: "#666", strokeWidth: "1.5" }) }) }, arm.cls))), _jsx("div", { style: { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 10, height: 10, borderRadius: "50%", background: "#ccc" } })] }), _jsx("span", { style: { fontSize: 11, color: "rgba(80,80,80,0.8)", background: "rgba(255,255,255,0.8)", padding: "3px 8px", borderRadius: 4 }, children: "Drag to reposition" })] })), s.image && (_jsx("button", { onClick: handleDelete, style: { position: "absolute", top: 10, right: 10, width: 28, height: 28, borderRadius: "50%", border: "0.5px solid #ccc", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 4 }, children: _jsxs("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", stroke: "#888", strokeWidth: "2", children: [_jsx("polyline", { points: "3 6 5 6 21 6" }), _jsx("path", { d: "M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" }), _jsx("path", { d: "M9 6V4h6v2M14 11v6M10 11v6" })] }) })), s.image && (_jsxs("div", { style: { position: "absolute", bottom: 10, left: 10, fontSize: 11, fontFamily: "monospace", color: "#555", background: "rgba(255,255,255,0.9)", border: "0.5px solid #ddd", borderRadius: 4, padding: "3px 7px", zIndex: 4, opacity: showBadge ? 1 : 0, transition: "opacity 0.2s" }, children: [Math.round(s.posX), "% ", Math.round(s.posY), "%"] }))] }), _jsxs("div", { style: { display: "flex", alignItems: "center", borderTop: "0.5px solid #ddd" }, children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderRight: "0.5px solid #ddd" }, children: [_jsx("span", { style: toolLabel, children: "Fit" }), _jsx("div", { style: { display: "flex", gap: 4 }, children: ["cover", "contain", "auto"].map(mode => (_jsx("button", { onClick: () => setBg(p => (Object.assign(Object.assign({}, p), { fit: mode }))), style: fitBtn(s.fit === mode), children: mode }, mode))) })] }), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, flex: 1, padding: "12px 16px", borderRight: "0.5px solid #ddd" }, children: [_jsx("span", { style: toolLabel, children: "Scale" }), _jsx("input", { type: "range", min: 10, max: 300, value: s.scale, step: 1, disabled: s.fit !== "auto", style: { flex: 1, opacity: s.fit === "auto" ? 1 : 0.3 }, onChange: e => setBg(p => (Object.assign(Object.assign({}, p), { scale: +e.target.value }))) }), _jsxs("span", { style: { fontSize: 12, color: "#666", fontFamily: "monospace", minWidth: 32, textAlign: "right" }, children: [s.scale, "%"] })] }), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, padding: "12px 16px" }, children: [_jsx("span", { style: toolLabel, children: "Repeat" }), _jsx("input", { type: "checkbox", checked: s.repeat, onChange: e => setBg(p => (Object.assign(Object.assign({}, p), { repeat: e.target.checked }))) })] })] })] }));
    };
    const TexturePanel = () => (_jsx("div", { style: styles.panel, children: "Texture / Pattern Library (Coming Soon)" }));
    // =========================
    // MAIN UI
    // =========================
    return (_jsx("div", { style: styles.container, children: instructionPage ? (_jsx(InstructionSelectElement, {})) : (_jsxs(_Fragment, { children: [_jsx(TabHeader, {}), activeTab === "solid" && _jsx(SolidPanel, {}), activeTab === "linear" && _jsx(LinearPanel, {}), activeTab === "radial" && _jsx(RadialPanel, {}), activeTab === "image" && _jsx(ImagePanel, {}), activeTab === "texture" && _jsx(TexturePanel, {})] })) }));
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
const loadGoogleFont = (font) => {
    const id = `gf-${font.replace(/\s+/g, "-")}`;
    if (document.getElementById(id))
        return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/\s+/g, "+")}:wght@300;400;500;600;700&display=swap`;
    document.head.appendChild(link);
};
export const TextPanel = ({ element, isDragging, setIsDragging, isDraggingRef, setIsActive, }) => {
    const [useBgAsText, setuseBgAsText] = useState(false);
    const [instructionPage, setInstructionPage] = useState(true);
    const [Bgcolor, setBgColor] = useState("");
    const [fontSearch, setFontSearch] = useState("");
    const [fontFamily, setFontFamily] = useState("Inter");
    useEffect(() => {
        setIsActive(true);
        if (element) {
            setInstructionPage(false);
        }
        else {
            setInstructionPage(true);
        }
        return () => setIsActive(false);
    }, [element]);
    // filter fonts
    const filteredFonts = useMemo(() => {
        return GOOGLE_FONTS.filter((f) => f.toLowerCase().includes(fontSearch.toLowerCase()));
    }, [fontSearch]);
    const handleFontChange = (font) => {
        setFontFamily(font);
        loadGoogleFont(font);
        if (element) {
            element.style.fontFamily = font;
        }
    };
    return (_jsx("div", { children: instructionPage ? (_jsx(InstructionSelectElement, {})) : (_jsxs("div", { style: {
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                padding: "12px",
            }, children: [_jsx(ColorInput, { element: element, mode: "color", Bgcolor: Bgcolor }), _jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "6px" }, children: [_jsx("label", { style: { fontSize: 12, opacity: 0.7 }, children: "Font Family (Google Fonts)" }), _jsx("select", { value: fontFamily, onChange: (e) => handleFontChange(e.target.value), style: {
                                padding: "6px",
                                borderRadius: "6px",
                                border: "1px solid #ccc",
                            }, children: filteredFonts.map((font) => (_jsx("option", { value: font, children: font }, font))) })] }), _jsx(DragNumberInput, { isDragging: isDragging, setIsDragging: setIsDragging, isDraggingRef: isDraggingRef, element: element, property: "fontWeight", symbol: "FW", label: "Font Weight", min: 100, max: 900, step: 100 }), _jsx(DragNumberInput, { isDragging: isDragging, setIsDragging: setIsDragging, isDraggingRef: isDraggingRef, element: element, property: "fontSize", symbol: "A", label: "Font Size", min: 0, max: 200, step: 1 }), _jsx(DragNumberInput, { isDragging: isDragging, setIsDragging: setIsDragging, isDraggingRef: isDraggingRef, element: element, property: "letterSpacing", symbol: "LS", label: "Letter Spacing", min: -10, max: 100, step: 1 }), _jsxs("div", { children: [_jsx(TextAlignStart, {}), _jsx(TextAlignJustify, {}), _jsx(TextAlignEnd, {})] }), _jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: "10px" }, children: [_jsx(Switch, { color: "#242424", checked: useBgAsText, onChange: () => {
                                setuseBgAsText((pre) => !pre);
                                if (element && useBgAsText) {
                                    element.style.webkitBackgroundClip = "text";
                                    element.style.webkitTextFillColor = "transparent";
                                }
                                else if (element) {
                                    element.style.webkitBackgroundClip = "";
                                    element.style.webkitTextFillColor = "";
                                }
                            } }), "use background as text color"] })] })) }));
};
// --- Shadow ---
const ShadowPanel = ({ element, setIsActive, }) => {
    const padRef = useRef(null);
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
        if (!element)
            return;
        if (useDropShadow) {
            // ⚠️ safer: append instead of overwrite
            element.style.filter = shadowValue;
            element.style.boxShadow = "";
        }
        else {
            element.style.boxShadow = shadowValue;
            element.style.filter = "";
        }
    }, [shadowValue, element, useDropShadow]);
    // 🎮 optimized drag (calculate once on mousedown)
    const handleDrag = (e) => {
        var _a;
        const rect = (_a = padRef.current) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect();
        if (!rect)
            return;
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const move = (ev) => {
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
    if (showInstruction)
        return _jsx(InstructionSelectElement, {});
    return (_jsxs("div", { style: { padding: 20 }, children: [_jsxs("div", { children: [_jsx("label", { children: "Drag to control X/Y" }), _jsx("div", { ref: padRef, onMouseDown: handleDrag, style: {
                            width: 150,
                            height: 150,
                            border: "1px solid #ccc",
                            position: "relative",
                            marginBottom: 10,
                            cursor: "crosshair",
                        }, children: _jsx("div", { style: {
                                position: "absolute",
                                left: `calc(50% + ${x}px)`,
                                top: `calc(50% + ${y}px)`,
                                width: 10,
                                height: 10,
                                background: "red",
                                borderRadius: "50%",
                                transform: "translate(-50%, -50%)",
                            } }) }), _jsxs("div", { children: ["X: ", x, " | Y: ", y] })] }), _jsxs("div", { children: [_jsx("label", { children: "Blur" }), _jsx(Tippy, { content: `Blur: ${blur}`, children: _jsx("input", { type: "range", min: 0, max: 100, value: blur, onChange: (e) => setBlur(+e.target.value) }) })] }), !useDropShadow && (_jsxs("div", { children: [_jsx("label", { children: "Spread" }), _jsx(Tippy, { content: `Spread: ${spread}`, zIndex: 9999, children: _jsx("input", { type: "range", min: -50, max: 50, value: spread, onChange: (e) => setSpread(+e.target.value) }) })] })), _jsxs("div", { children: [_jsx("label", { children: "Color" }), _jsx("input", { type: "color", value: color, onChange: (e) => setColor(e.target.value) })] }), !useDropShadow && (_jsx("div", { children: _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: inset, onChange: () => setInset((p) => !p) }), "Inset"] }) })), _jsx("div", { children: _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: useDropShadow, onChange: () => setUseDropShadow((p) => !p) }), "Use drop-shadow"] }) })] }));
};
// --- Border ---
const BorderPanel = ({ element, setIsDragging, isDragging, isDraggingRef, setIsActive }) => {
    const [setInstrcutionPage, setsetInstrcutionPage] = useState(true);
    useEffect(() => {
        setIsActive(true);
        if (element) {
            setsetInstrcutionPage(false);
        }
        else {
            setsetInstrcutionPage(true);
        }
        return () => {
            setIsActive(false);
        };
    }, [element]);
    return (_jsxs("div", { style: { padding: '12px' }, children: [_jsx(ColorInput, { Bgcolor: 'null', element: element, mode: "borderColor" }), _jsx(DragNumberInput, { isDragging: isDragging, setIsDragging: setIsDragging, isDraggingRef: isDraggingRef, element: element, property: "borderWidth", symbol: "BR", label: "Border Radius", min: 0, max: 99999999, step: 1 }), _jsx(DragNumberInput, { isDragging: isDragging, setIsDragging: setIsDragging, isDraggingRef: isDraggingRef, element: element, property: "borderRadius", symbol: "BR", label: "Border Radius", min: 0, max: 99999999, step: 1 })] }));
};
// --- Transform ---
const TransformPanel = ({ element, setIsActive }) => {
    const [setInstrcutionPage, setsetInstrcutionPage] = useState(true);
    useEffect(() => {
        setIsActive(true);
        if (element) {
            setsetInstrcutionPage(false);
        }
        else {
            setsetInstrcutionPage(true);
        }
        return () => {
            setIsActive(false);
        };
    }, [element]);
    return (_jsx("div", { style: { padding: '12px' }, children: _jsx(Joystick3D, { element: element }) }));
};
const FreeDraw = () => {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const drawingRef = useRef(false);
    const [brushColor, setBrushColor] = useState("#000000");
    const [brushSize, setBrushSize] = useState(5);
    const [history, setHistory] = useState([]);
    const startDrawing = (e) => {
        if (!ctxRef.current)
            return;
        drawingRef.current = true;
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(e.clientX, e.clientY);
    };
    const draw = (e) => {
        if (!drawingRef.current || !ctxRef.current)
            return;
        ctxRef.current.lineTo(e.clientX, e.clientY);
        ctxRef.current.stroke();
    };
    const stopDrawing = () => {
        if (!drawingRef.current || !canvasRef.current)
            return;
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
        if (canvasRef.current)
            return;
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
        if (!canvasRef.current || !ctxRef.current || history.length === 0)
            return;
        const newHistory = [...history];
        newHistory.pop();
        setHistory(newHistory);
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (newHistory.length === 0)
            return;
        const img = new Image();
        img.src = newHistory[newHistory.length - 1];
        img.onload = () => {
            ctx.drawImage(img, 0, 0);
        };
    };
    const handleColorChange = (e) => {
        const color = e.target.value;
        setBrushColor(color);
        if (ctxRef.current)
            ctxRef.current.strokeStyle = color;
    };
    const handleSizeChange = (e) => {
        const size = parseInt(e.target.value, 10);
        setBrushSize(size);
        if (ctxRef.current)
            ctxRef.current.lineWidth = size;
    };
    return (_jsxs("div", { children: [_jsx("button", { onClick: handleBrushClick, children: "Brush" }), _jsx("button", { onClick: handleUndo, children: "Undo" }), _jsx("input", { type: "color", value: brushColor, onChange: handleColorChange }), _jsx("input", { type: "range", min: "1", max: "50", value: brushSize, onChange: handleSizeChange })] }));
};
const Comments = () => {
    const zIndexCounter = useRef(1000);
    const addComment = () => {
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
    const makeDraggable = (element) => {
        interact(element).draggable({
            listeners: {
                move(event) {
                    const target = event.target;
                    const x = (parseFloat(target.getAttribute("data-x") || "0")) + event.dx;
                    const y = (parseFloat(target.getAttribute("data-y") || "0")) + event.dy;
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
    return (_jsx("div", { children: _jsx("button", { onClick: addComment, children: "Add Comments" }) }));
};
const CSSFiltersPanel = ({ element, setIsActive }) => {
    return (_jsx("div", { children: _jsx(ColorUI, { element: element }) }));
};
// --- Static panels (no props needed) ---
const ScreenshotPanel = () => _jsx(ScreenShot, {});
const ColorPickerPanel = () => _jsx(FreeDraw, {});
const FreeDrawPanel = () => _jsx(FreeDraw, {});
const Comment = () => _jsx(Comments, {});
const VisualEditor = ({ element, isDragging, setIsDragging, isDraggingRef, setIsActive, isActive }) => {
    const [searchQuery, setSearchQuery] = useState('');
    // ✅ useMemo rebuilds the LIST STRUCTURE (icons, titles, elementProps) when deps change,
    // but Element values point to STABLE hoisted components above — React never remounts them.
    const listsData = useMemo(() => [
        {
            title: 'Spacing',
            icon: _jsx(PanelRightDashed, { size: 24, color: "#3B9D55" }),
            Element: DimensionsPanel,
            elementProps: { element, isDragging, setIsDragging, isDraggingRef, setIsActive },
            tags: ["width", "height", "dimensions",]
        },
        {
            title: 'Background',
            icon: _jsx(Wallpaper, { size: 24, color: "#3B9D55" }),
            Element: BackgroundPanel,
            elementProps: { element, setIsActive },
            tags: ["bg", "background", "wallpaper",]
        },
        {
            title: 'Text',
            icon: _jsx(ALargeSmall, { size: 24, color: "#3B9D55" }),
            Element: TextPanel,
            elementProps: { element, isDragging, setIsDragging, isDraggingRef, setIsActive },
            tags: ["text", "font", 'typography']
        },
        {
            title: 'Screenshot',
            icon: _jsx(Camera, { size: 24, color: "#3B9D55" }),
            Element: ScreenshotPanel,
            elementProps: {},
            tags: ["Screenshot", "Capture"]
        },
        {
            title: 'Change Theme',
            icon: _jsx(Box, { size: 24, color: "#3B9D55" }),
            Element: CSSFiltersPanel,
            elementProps: { element, setIsActive },
            tags: ['Theme Change', 'Filters']
        },
        {
            title: 'Color Picker',
            icon: _jsx(Brush, { size: 24, color: "#3B9D55" }),
            Element: ColorPickerPanel,
            elementProps: {},
            tags: ['color picker', 'eye dropper']
        },
        {
            title: 'Free Draw',
            icon: _jsx(PenTool, { size: 24, color: "#3B9D55" }),
            Element: FreeDrawPanel,
            elementProps: {},
            tags: ['draw', 'pen tool', 'brush', 'pencil']
        },
        {
            title: 'Transform',
            icon: _jsx(Stone, { size: 24, color: "#3B9D55" }),
            Element: TransformPanel,
            elementProps: { element, isDragging, setIsDragging, isDraggingRef, setIsActive },
            tags: ['transform', 'rotate', 'skew', '3D']
        },
        {
            title: 'Shadow',
            icon: _jsx(Eclipse, { size: 24, color: "#3B9D55" }),
            Element: ShadowPanel,
            elementProps: { element, isDragging, setIsDragging, isDraggingRef, setIsActive },
            tags: ['shadow', 'depth', 'light']
        },
        {
            title: 'Border',
            icon: _jsx(SquareRoundCorner, { size: 18, color: "#3B9D55" }),
            Element: BorderPanel,
            elementProps: { element, isDragging, setIsDragging, isDraggingRef, setIsActive },
            tags: ['border', 'outline']
        },
        {
            title: 'Export Element',
            icon: _jsx(FileInput, { size: 18, color: "#3B9D55" }),
            Element: BorderPanel,
            elementProps: { element, setIsActive },
            tags: ['border', 'outline']
        }, {
            title: 'CSS Inspector',
            icon: _jsx(SquareMousePointer, { size: 18, color: "#3B9D55" }),
            Element: BorderPanel,
            elementProps: { element },
            tags: ['border', 'outline']
        },
        {
            title: 'Comments',
            icon: _jsx(Tag, { size: 18, color: "#3B9D55" }),
            Element: Comment,
            elementProps: { element },
            tags: ['border', 'outline']
        },
        {
            title: 'Ask AI',
            icon: _jsx(MessageCircleQuestionMark, { size: 18, color: "#3B9D55" }),
            Element: AskAI,
            elementProps: { element, setIsActive },
            tags: ['border', 'outline']
        },
    ], [element, isDragging, setIsDragging, isDraggingRef]);
    const styleH1 = {
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
        if (!searchQuery.trim())
            return listsData;
        const q = searchQuery.toLowerCase();
        return listsData.filter(item => {
            var _a;
            return item.title.toLowerCase().includes(q) ||
                ((_a = item.tags) === null || _a === void 0 ? void 0 : _a.some(tag => tag.toLowerCase().includes(q)));
        });
    }, [listsData, searchQuery]);
    return (_jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', height: '', justifyContent: 'center', alignItems: 'center', gap: '8px', width: '100%' }, children: [_jsx(Tippy, { content: _jsx("span", { style: { color: "white", fontSize: '14px', borderRadius: '9px', fontWeight: '500', background: '#1b1b1b', padding: '6px 10px' }, children: "Edit Mode" }), animation: "fade", duration: [200, 150], placement: "top", zIndex: 9999, appendTo: (ref) => {
                            const root = ref.getRootNode();
                            if (root instanceof ShadowRoot) {
                                return root; // 👈 safe cast for Tippy
                            }
                            return document.body;
                        }, children: _jsx("div", { children: _jsx(Switch, { color: "#242424", checked: isActive, onChange: () => { setIsActive(pre => !pre); } }) }) }), _jsxs("div", { style: styleH1, children: ["webbit", ' '] }), _jsx("span", { style: {
                            width: '8px',
                            height: '8px',
                            backgroundColor: '#3B9D55',
                            borderRadius: '50%',
                            display: 'inline-block',
                        } })] }), _jsx(SearchBar, { query: searchQuery, onQueryChange: setSearchQuery }), _jsx(SingleFocusLists, { initialLists: filteredLists })] }));
};
export default VisualEditor;
