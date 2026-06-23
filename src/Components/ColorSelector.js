import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useRef } from "react";
import { RefreshCcw, ChevronRight } from "lucide-react";
import Tippy from "@tippyjs/react";
import { generatePairings, autoMode, } from "./Colorpairingengine";
import { rgbStringToHex, rgbaToRgb, rgbToHsl } from "../UI-Models/ColorsConversions";
// ── Helpers ───────────────────────────────────
// ── Mode labels for the picker UI ─────────────
const MODE_LABELS = {
    analogous: "Analogous",
    "analogous-wide": "Analogous wide",
    monochromatic: "Monochromatic",
    tonal: "Tonal",
    "neutral-blend": "Neutral blend",
    "split-complement": "Split complement",
};
const ALL_MODES = Object.keys(MODE_LABELS);
function makePairing(base, mode, seed) {
    const m = mode !== null && mode !== void 0 ? mode : autoMode(base);
    const s = seed !== null && seed !== void 0 ? seed : Math.floor(Math.random() * 1e9);
    return { mode: m, seed: s, colors: generatePairings(base, m, s, 4) };
}
// ── Component ─────────────────────────────────
const ColorSelector = ({ colors, setColors, pickColorState }) => {
    const [expanded, setExpanded] = useState({});
    const [pairings, setPairings] = useState({});
    const [copyIndex, setCopyIndex] = useState(null);
    const [hoverIndex, setHoverIndex] = useState(null);
    const [selected, setSelected] = useState("HEX");
    const converters = {
        RGB: (color) => color,
        HEX: rgbStringToHex,
        HSL: rgbToHsl,
    };
    const colorMode = selected;
    useEffect(() => {
        chrome.storage.local.get(["colorMode"], (result) => {
            var _a;
            setSelected((_a = result.colorMode) !== null && _a !== void 0 ? _a : "HEX");
        });
    }, []);
    // ── EyeDropper ─────────────────────────────
    const firstRender = useRef(true);
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return; // skip first render
        }
        Pick(); // runs only when pickColorState changes after mount
    }, [pickColorState]);
    const Pick = async () => {
        if (!("EyeDropper" in window)) {
            alert("EyeDropper API not supported in this browser.");
            return;
        }
        const eyeDropper = new window.EyeDropper();
        try {
            const result = await eyeDropper.open();
            const color = rgbaToRgb(result.sRGBHex);
            setColors(prev => [color, ...prev]);
            setExpanded(prev => (Object.assign(Object.assign({}, prev), { 0: false })));
            setPairings(prev => {
                // shift existing pairing indices up by 1
                const shifted = {};
                Object.entries(prev).forEach(([k, v]) => {
                    shifted[+k + 1] = v;
                });
                return shifted;
            });
            await navigator.clipboard.writeText(result.sRGBHex).catch(() => { });
        }
        catch (err) {
            console.error("Eyedropper failed:", err);
        }
    };
    // ── Expand / collapse ──────────────────────
    const toggleExpanded = (index) => {
        const next = !expanded[index];
        setExpanded(prev => (Object.assign(Object.assign({}, prev), { [index]: next })));
        // Generate initial pairings on first expand
        if (next && !pairings[index]) {
            setPairings(prev => (Object.assign(Object.assign({}, prev), { [index]: makePairing(colors[index]) })));
        }
    };
    // ── Refresh pairings ───────────────────────
    const refreshPairings = (e, index) => {
        e.stopPropagation();
        setPairings(prev => {
            var _a;
            return (Object.assign(Object.assign({}, prev), { [index]: makePairing(colors[index], (_a = prev[index]) === null || _a === void 0 ? void 0 : _a.mode, // keep same mode, new seed
                Math.floor(Math.random() * 1e9)) }));
        });
    };
    // ── Change mode ────────────────────────────
    const changeMode = (index, mode) => {
        setPairings(prev => (Object.assign(Object.assign({}, prev), { [index]: makePairing(colors[index], mode) })));
    };
    // ── Remove ─────────────────────────────────
    const removeColor = (index) => {
        setColors(prev => prev.filter((_, i) => i !== index));
        setExpanded(prev => {
            const next = {};
            Object.entries(prev).forEach(([k, v]) => {
                if (+k !== index)
                    next[+k > index ? +k - 1 : +k] = v;
            });
            return next;
        });
        setPairings(prev => {
            const next = {};
            Object.entries(prev).forEach(([k, v]) => {
                if (+k !== index)
                    next[+k > index ? +k - 1 : +k] = v;
            });
            return next;
        });
    };
    // ── Copy ───────────────────────────────────
    const copyColor = async (color, index) => {
        // const hex = rgbStringToHex(color);
        const result = converters[selected](color);
        if (!result)
            return;
        await navigator.clipboard.writeText(result).catch(() => { });
        setCopyIndex(index);
        setTimeout(() => setCopyIndex(null), 1000);
    };
    function getTextColor(rgb) {
        const values = rgb.match(/\d+/g);
        if (!values || values.length < 3)
            return "black";
        const [r, g, b] = values.map(Number);
        // brightness formula
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 128 ? "black" : "white";
    }
    // ADD with other states
    const [copiedPairing, setCopiedPairing] = useState(null);
    // ADD with copyColor()
    const copyPairingColor = async (hex, key) => {
        // const color = converters[selected](hex)
        await navigator.clipboard.writeText(hex).catch(() => { });
        setCopiedPairing(key);
        setTimeout(() => setCopiedPairing(null), 1000);
    };
    // ── Render ─────────────────────────────────
    return (_jsx("div", { style: { position: "relative", height: '100%', width: '100%' }, children: _jsx("div", { style: {
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                padding: "15px",
                maxHeight: "100vh",
                overflowY: "auto",
            }, children: colors.map((color, index) => {
                const isExpanded = !!expanded[index];
                const pairing = pairings[index];
                const isHovered = hoverIndex === index;
                return (_jsxs("div", { style: {}, 
                    // onMouseDown={(e) => {
                    //   e.currentTarget.style.transform = "scale(0.99)";
                    //   e.currentTarget.style.boxShadow =
                    //     "inset 0 3px 8px rgba(0,0,0,.4)";
                    // }}
                    // onMouseUp={(e) => {
                    //   e.currentTarget.style.transform = "scale(1)";
                    //   e.currentTarget.style.boxShadow =
                    //     "0 8px 20px rgba(0,0,0,.25)";
                    // }}
                    onMouseEnter: (e) => {
                        setHoverIndex(index);
                        // e.currentTarget.style.transform = "scale(1.1)";
                        // e.currentTarget.style.boxShadow =
                        //   "0 8px 20px rgba(0,0,0,.25)";
                    }, onMouseLeave: (e) => {
                        setHoverIndex(null);
                        //  e.currentTarget.style.transform = "scale(1)";
                        //  e.currentTarget.style.boxShadow =
                        //    "0 3px 10px rgba(0,0,0,.18)";
                    }, children: [_jsxs("div", { style: {
                                backgroundColor: color,
                                height: "60px",
                                width: "100%",
                                position: "relative",
                                boxShadow: "1px 0px 12px #000, inset 15px 12px 13.9px -1px rgba(0,0,0,0.35)",
                                borderRadius: isExpanded ? "8px 8px 0 0" : "8px",
                                transition: "border-radius 0.2s",
                                border: '1px solid #2f2f2f',
                                userSelect: "none",
                                animation: "ss-popIn .22s cubic-bezier(0.34,1.56,0.64,1)",
                                transformOrigin: "left"
                            }, children: [_jsxs("div", { style: { display: "flex", height: "100%" }, children: [_jsx(Tippy, { content: _jsx("span", { style: {
                                                    color: "#EAEAEA",
                                                    fontSize: "16px",
                                                    fontWeight: 500,
                                                    letterSpacing: "0.2px",
                                                    background: "#1E1E1E",
                                                    padding: "7px 11px",
                                                    borderRadius: "10px",
                                                    border: "1px solid rgba(255,255,255,0.06)",
                                                    boxShadow: "0 8px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.03)",
                                                }, children: "Pairing Colors" }), animation: "shift-away-subtle", duration: [160, 110], delay: [120, 0], placement: "top", offset: [10, 10], zIndex: 9999, appendTo: (ref) => {
                                                const root = ref.getRootNode();
                                                if (root instanceof ShadowRoot) {
                                                    return root; // 👈 safe cast for Tippy
                                                }
                                                return document.body;
                                            }, children: _jsx("div", { onMouseDown: (e) => {
                                                    e.currentTarget.style.transform = "scale(0.98)";
                                                    // e.currentTarget.style.boxShadow =
                                                    //   "inset 0 3px 8px rgba(0,0,0,.4)";
                                                }, onMouseUp: (e) => {
                                                    e.currentTarget.style.transform = "scale(1.02)";
                                                    // e.currentTarget.style.boxShadow =
                                                    //   "0 8px 20px rgba(0,0,0,.25)";
                                                }, onMouseEnter: (e) => {
                                                    e.currentTarget.style.transform = "scale(1.1)";
                                                    // e.currentTarget.style.boxShadow =
                                                    //   "0 8px 20px rgba(0,0,0,.25)";
                                                }, onMouseLeave: (e) => {
                                                    e.currentTarget.style.transform = "scale(1)";
                                                    // e.currentTarget.style.boxShadow =
                                                    //   "0 3px 10px rgba(0,0,0,.18)";
                                                }, children: _jsx("div", { onClick: () => toggleExpanded(index), style: {
                                                        opacity: isHovered ? 1 : 0,
                                                        transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                                                        transition: "transform 0.25s ease, opacity 0.2s",
                                                        height: "60px",
                                                        width: "60px",
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        cursor: "pointer",
                                                        flexShrink: 0,
                                                    }, children: _jsx(ChevronRight, { strokeWidth: 6, color: getTextColor(color), size: 14 }) }) }) }), _jsx("div", { onMouseDown: (e) => {
                                                e.currentTarget.style.transform = "scale(0.98)";
                                                // e.currentTarget.style.boxShadow =
                                                //   "inset 0 3px 8px rgba(0,0,0,.4)";
                                            }, onMouseUp: (e) => {
                                                e.currentTarget.style.transform = "scale(1)";
                                                // e.currentTarget.style.boxShadow =
                                                //   "0 8px 20px rgba(0,0,0,.25)";
                                            }, onMouseEnter: (e) => {
                                                e.currentTarget.style.transform = "scale(1.1)";
                                                // e.currentTarget.style.boxShadow =
                                                //   "0 8px 20px rgba(0,0,0,.25)";
                                            }, onMouseLeave: (e) => {
                                                e.currentTarget.style.transform = "scale(1)";
                                                // e.currentTarget.style.boxShadow =
                                                //   "0 3px 10px rgba(0,0,0,.18)";
                                            }, onClick: () => {
                                                console.log("this is color ,", color);
                                                copyColor(color, index);
                                            }, style: {
                                                flex: 1,
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                cursor: "pointer",
                                            }, children: copyIndex === index ? (_jsx("span", { style: { fontSize: "16px", fontWeight: "700", color: getTextColor(color) }, children: "Copied" })) : (_jsx("span", { style: { fontSize: "16px", fontWeight: "700", color: getTextColor(color) }, children: converters[selected](color) })) })] }), _jsx("div", { onMouseDown: (e) => {
                                        e.currentTarget.style.transform = "scale(0.98)";
                                        // e.currentTarget.style.boxShadow =
                                        //   "inset 0 3px 8px rgba(0,0,0,.4)";
                                    }, onMouseUp: (e) => {
                                        e.currentTarget.style.transform = "scale(1)";
                                        // e.currentTarget.style.boxShadow =
                                        //   "0 8px 20px rgba(0,0,0,.25)";
                                    }, onMouseEnter: (e) => {
                                        e.currentTarget.style.transform = "scale(1.1)";
                                        // e.currentTarget.style.boxShadow =
                                        //   "0 8px 20px rgba(0,0,0,.25)";
                                    }, onMouseLeave: (e) => {
                                        e.currentTarget.style.transform = "scale(1)";
                                        // e.currentTarget.style.boxShadow =
                                        //   "0 3px 10px rgba(0,0,0,.18)";
                                    }, onClick: () => removeColor(index), style: {
                                        opacity: isHovered ? 1 : 0,
                                        position: "absolute",
                                        right: "-5px",
                                        top: "-5px",
                                        width: "24px",
                                        height: "24px",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        background: "rgba(23, 14, 20)",
                                        borderRadius: "100%",
                                        color: "white",
                                        fontWeight: "600",
                                        border: "0.7px solid grey",
                                        cursor: "pointer",
                                        transition: "opacity 0.2s",
                                        fontSize: "12px",
                                    }, children: "\u2715" })] }), _jsx("div", { style: {
                                maxHeight: isExpanded ? "260px" : "0px",
                                overflow: "hidden",
                                transition: "max-height 0.35s ease",
                                borderRadius: "0 0 8px 8px",
                                background: "rgba(255,255,255,0.04)",
                                border: isExpanded ? "1px solid rgba(255,255,255,0.08)" : "none",
                                borderTop: "none",
                            }, children: pairing && (_jsxs("div", { style: { padding: "10px 12px 12px" }, children: [_jsxs("div", { style: {
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            marginBottom: "10px",
                                        }, children: [_jsx("select", { value: pairing.mode, onChange: e => changeMode(index, e.target.value), style: {
                                                    flex: 1,
                                                    background: "rgba(255,255,255,0.07)",
                                                    border: "1px solid rgba(255,255,255,0.12)",
                                                    borderRadius: "6px",
                                                    color: "white",
                                                    fontSize: "12px",
                                                    padding: "4px 8px",
                                                    cursor: "pointer",
                                                    outline: "none",
                                                }, children: ALL_MODES.map(m => (_jsx("option", { value: m, style: { background: "#1a1a1a" }, children: MODE_LABELS[m] }, m))) }), _jsx(Tippy, { content: _jsx("span", { style: { color: "gray", fontSize: '14px', borderRadius: '9px', fontWeight: '500', background: '#1b1b1b', padding: '6px 10px' }, children: "Regenerate" }), animation: "fade", duration: [200, 150], placement: "top", zIndex: 9999, appendTo: (ref) => {
                                                    const root = ref.getRootNode();
                                                    if (root instanceof ShadowRoot) {
                                                        return root; // 👈 safe cast for Tippy
                                                    }
                                                    return document.body;
                                                }, children: _jsx("button", { onClick: e => refreshPairings(e, index), style: {
                                                        background: "rgba(255,255,255,0.07)",
                                                        border: "1px solid rgba(255,255,255,0.12)",
                                                        borderRadius: "6px",
                                                        color: "white",
                                                        cursor: "pointer",
                                                        padding: "5px 8px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                    }, children: _jsx(RefreshCcw, { size: 13 }) }) })] }), _jsx("div", { style: { display: "flex", gap: "6px" }, children: pairing.colors.map((c, ci) => {
                                            const hex = (() => {
                                                const tmp = document.createElement("canvas");
                                                tmp.width = tmp.height = 1;
                                                const ctx = tmp.getContext("2d");
                                                ctx.fillStyle = c;
                                                ctx.fillRect(0, 0, 1, 1);
                                                const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
                                                return `#${r.toString(16).padStart(2, "0")}${g
                                                    .toString(16)
                                                    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
                                            })();
                                            const pairKey = `${index}-${ci}`;
                                            const textColor = getTextColor(`rgb(${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)})`);
                                            return (_jsx(Tippy, { content: _jsx("span", { style: {
                                                        color: "white",
                                                        fontSize: "12px",
                                                        borderRadius: "6px",
                                                        fontWeight: "500",
                                                        background: "#1b1b1b",
                                                        padding: "4px 8px",
                                                        // fontFamily: "monospace",
                                                    }, children: hex }), animation: "fade", duration: [150, 100], placement: "top", zIndex: 9999, appendTo: () => document.body, children: _jsx("div", { onMouseEnter: (e) => {
                                                        //   (e.currentTarget as HTMLDivElement).style.transform =
                                                        //   "scaleY(1.04)";
                                                        // (e.currentTarget as HTMLDivElement).style.boxShadow =
                                                        //   "inset 0 0 0 1px rgba(255,255,255,0.2), 0 4px 14px rgba(0,0,0,0.5)";
                                                        e.currentTarget.style.transform = "scale(1.1)";
                                                        e.currentTarget.style.boxShadow =
                                                            "0 8px 20px rgba(0,0,0,.25)";
                                                    }, onMouseLeave: (e) => {
                                                        //   (e.currentTarget as HTMLDivElement).style.transform =
                                                        //   "scaleY(1)";
                                                        // (e.currentTarget as HTMLDivElement).style.boxShadow =
                                                        //   "inset 0 0 0 1px rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.4)";
                                                        e.currentTarget.style.transform = "scale(1)";
                                                        e.currentTarget.style.boxShadow =
                                                            "0 3px 10px rgba(0,0,0,.18)";
                                                    }, onMouseDown: (e) => {
                                                        e.currentTarget.style.transform = "scale(0.96)";
                                                        e.currentTarget.style.boxShadow =
                                                            "inset 0 3px 8px rgba(0,0,0,.4)";
                                                    }, onMouseUp: (e) => {
                                                        e.currentTarget.style.transform = "scale(1.02)";
                                                        e.currentTarget.style.boxShadow =
                                                            "0 8px 20px rgba(0,0,0,.25)";
                                                    }, onClick: () => copyPairingColor(hex, pairKey), title: "Click to copy", style: {
                                                        flex: 1,
                                                        height: "80px",
                                                        background: c,
                                                        borderRadius: "6px",
                                                        cursor: "pointer",
                                                        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.4)",
                                                        transition: "transform 0.15s, box-shadow 0.15s",
                                                        position: "relative",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        userSelect: "none",
                                                    }, children: copiedPairing === pairKey && (_jsx("span", { style: {
                                                            color: textColor,
                                                            fontSize: "12px",
                                                            fontWeight: "700",
                                                            userSelect: "none",
                                                            opacity: 1,
                                                            transition: "0.2s",
                                                        }, children: "Copied" })) }) }, ci));
                                        }) })] })) })] }, index));
            }) }) }));
};
// ── Mode descriptions ─────────────────────────
const MODE_DESCRIPTIONS = {
    analogous: "Neighbouring hues 15–40° apart. Harmonious and easy on the eye.",
    "analogous-wide": "Broader hue spread of 40–70°. More contrast while staying cohesive.",
    monochromatic: "Same hue throughout. Saturation and lightness vary to separate swatches.",
    tonal: "Same hue with dramatic lightness steps — great for depth progressions.",
    "neutral-blend": "Desaturates progressively toward a near-neutral. Grounds vivid palettes.",
    "split-complement": "Jumps ~150° across the wheel, alternating sides. High contrast, softened saturation.",
};
export default ColorSelector;
