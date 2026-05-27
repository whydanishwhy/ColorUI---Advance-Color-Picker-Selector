import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState, useCallback, useEffect, } from "react";
import { baseColor } from "../UI-Models/Constant";
import { ChevronUp, X, SquareDashed, } from "lucide-react";
import Tippy from "@tippyjs/react";
const Home = ({ setSelectArea, }) => {
    const glowRef = useRef(null);
    const [grayscale, setGrayscale] = useState(0);
    const [hueRotate, setHueRotate] = useState(0);
    const [invert, setInvert] = useState(0);
    const [blur, setBlur] = useState(0);
    const [contrast, setContrast] = useState(100);
    const popupRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [isAllowedOnMedia, setisAllowedOnMedia] = useState(false);
    useEffect(() => {
        chrome.storage.local.get("disabledOnMedia", ({ disabledOnMedia }) => {
            setisAllowedOnMedia(disabledOnMedia !== null && disabledOnMedia !== void 0 ? disabledOnMedia : false);
        });
    }, []);
    /* ---------------------------------- */
    /* APPLY FILTERS */
    /* ---------------------------------- */
    const applyFilters = useCallback((g = grayscale, h = hueRotate, i = invert, b = blur, c = contrast) => {
        const target = document.getElementById("__CHROMA_LENS_SELECTED_AREA__") ||
            document.getElementById("custom-filter-layer");
        if (!target)
            return;
        target.style.backdropFilter = `
        grayscale(${g}%)
        hue-rotate(${h}deg)
        invert(${i})
        blur(${b}px)
        contrast(${c}%)
      `;
        // all media elements
        const mediaElements = document.querySelectorAll(`
          img,
          video,
          picture,
          canvas,
          svg,
          iframe
        `);
        mediaElements.forEach((el) => {
            const element = el;
            // prevent affecting your extension UI
            if (element.closest("#__CHROMA_LENS_SELECTED_AREA__") ||
                element.closest("#custom-filter-layer")) {
                return;
            }
            if (i >= 1) {
                // here state 
                if (isAllowedOnMedia)
                    return;
                element.style.filter = "invert(1)";
            }
            else {
                // reset
                element.style.filter = "";
            }
        });
    }, [
        grayscale,
        hueRotate,
        invert,
        blur,
        contrast,
    ]);
    /* ---------------------------------- */
    /* GLOW CLICK */
    /* ---------------------------------- */
    const handleGlowClick = () => {
        const newHue = Math.floor(Math.random() * 360);
        const newInvert = Math.random() > 0.5 ? 1 : 0;
        setHueRotate(newHue);
        setInvert(newInvert);
        applyFilters(grayscale, newHue, newInvert, blur, contrast);
    };
    /* ---------------------------------- */
    /* GLOW POINTER EVENTS */
    /* ---------------------------------- */
    const glowDown = (e) => {
        e.stopPropagation();
        e.currentTarget.style.transform =
            "scale(.96)";
    };
    const glowUp = (e) => {
        e.stopPropagation();
        e.currentTarget.style.transform =
            "scale(1)";
        handleGlowClick();
    };
    const glowCancel = (e) => {
        e.currentTarget.style.transform =
            "scale(1)";
    };
    const SelectAreaFn = () => {
        const host = document.getElementById("__EXT_HOST__");
        if (host) {
            host.style.display = "none";
            setSelectArea(true);
        }
    };
    useEffect(() => {
        const h = (e) => {
            if (popupRef.current &&
                !popupRef.current.contains(e.target))
                setOpen(false);
            setGrayscale(0);
            setBlur(0);
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);
    const Reset = () => {
        const customDiv = document.getElementById("custom-drawn-div");
        const customLayer = document.getElementById("custom-filter-layer");
        if (customDiv) {
            customDiv.style.backdropFilter = "none";
        }
        if (customLayer) {
            customLayer.style.backdropFilter = "none";
        }
        resetAllAppliedColors();
    };
    const resetAllAppliedColors = () => {
        /* Remove every overlay created by your system */
        document
            .querySelectorAll("[data-color-input-overlay]")
            .forEach((overlay) => overlay.remove());
        /* Find all elements in page */
        document
            .querySelectorAll("*")
            .forEach((node) => {
            const el = node;
            /* Restore position if patched */
            if (el.getAttribute("data-color-input-orig-position") === "static") {
                el.style.position = "";
                el.removeAttribute("data-color-input-orig-position");
            }
            /* Remove z-index patch */
            if (el.getAttribute("data-color-input-z-patched") === "true") {
                el.style.zIndex = "";
                el.removeAttribute("data-color-input-z-patched");
            }
            /* Remove all color styles your tool may apply */
            el.style.color = "";
            el.style.background = "";
            el.style.backgroundColor = "";
            el.style.borderColor = "";
            el.style.boxShadow = "";
            el.style.webkitBackgroundClip = "";
            el.style.webkitTextFillColor = "";
            el.style.textShadow = "";
        });
    };
    const [ShowReset, setShowReset] = useState(false);
    useEffect(() => {
        const customDiv = document.getElementById("custom-drawn-div");
        const customLayer = document.getElementById("custom-filter-layer");
        const checkBackdropFilter = () => {
            const divStyle = customDiv ? window.getComputedStyle(customDiv) : null;
            const layerStyle = customLayer ? window.getComputedStyle(customLayer) : null;
            const hasDivFilter = (divStyle === null || divStyle === void 0 ? void 0 : divStyle.backdropFilter) !== undefined &&
                divStyle.backdropFilter !== "none";
            const hasLayerFilter = (layerStyle === null || layerStyle === void 0 ? void 0 : layerStyle.backdropFilter) !== undefined &&
                layerStyle.backdropFilter !== "none";
            const hasWebkitDivFilter = (divStyle === null || divStyle === void 0 ? void 0 : divStyle.webkitBackdropFilter) &&
                divStyle.webkitBackdropFilter !== "none";
            const hasWebkitLayerFilter = (layerStyle === null || layerStyle === void 0 ? void 0 : layerStyle.webkitBackdropFilter) &&
                layerStyle.webkitBackdropFilter !== "none";
            const hasFilter = hasDivFilter ||
                hasLayerFilter ||
                hasWebkitDivFilter ||
                hasWebkitLayerFilter;
            setShowReset(hasFilter);
        };
        checkBackdropFilter();
        const observer = new MutationObserver(() => {
            checkBackdropFilter();
        });
        if (customDiv) {
            observer.observe(customDiv, {
                attributes: true,
                attributeFilter: ["style", "class"],
            });
        }
        if (customLayer) {
            observer.observe(customLayer, {
                attributes: true,
                attributeFilter: ["style", "class"],
            });
        }
        return () => observer.disconnect();
    }, []);
    return (_jsxs("div", { style: {
            display: "grid",
            placeItems: "center",
            userSelect: "none",
            WebkitUserSelect: "none",
            touchAction: "none",
            // marginTop: "10px",
            // marginBottom: "30px",
        }, children: [_jsx("div", { style: {
                    position: "relative",
                    width: 170,
                    height: 170,
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                }, children: _jsx("div", { onMouseEnter: (e) => {
                        e.currentTarget.style.transform = "scale(1.06)";
                    }, onMouseLeave: (e) => {
                        e.currentTarget.style.transform = "scale(1)";
                    }, ref: glowRef, onPointerDown: glowDown, onPointerUp: glowUp, onPointerCancel: glowCancel, style: {
                        position: "absolute",
                        inset: 0,
                        margin: "auto",
                        width: 150,
                        height: 150,
                        borderRadius: "50%",
                        background: "#121212",
                        cursor: "pointer",
                        zIndex: 2,
                        transition: "transform .08s ease",
                        boxShadow: `
              0 4px 10px ${baseColor},
              inset 8px 12px 18px rgba(51,51,51,.25)
            `,
                    } }) }), 0 ? _jsx("div", { style: {
                    display: "flex",
                    justifyContent: "flex-end",
                    position: "fixed",
                    bottom: "180px",
                    left: "94px",
                    zIndex: 2147483645,
                }, children: _jsx(Tippy, { content: _jsx("span", { style: { color: "gray", fontSize: '14px', borderRadius: '9px', fontWeight: '600', background: '#1b1b1b', padding: '6px 10px' }, children: "Reset" }), animation: "fade", duration: [200, 150], placement: "top", zIndex: 9999, appendTo: (ref) => {
                        const root = ref.getRootNode();
                        if (root instanceof ShadowRoot) {
                            return root; // 👈 safe cast for Tippy
                        }
                        return document.body;
                    }, children: _jsx("div", { onMouseEnter: (e) => {
                            // e.currentTarget.style.background = "#222";
                            e.currentTarget.style.transform = "scale(1.06)";
                            e.currentTarget.style.boxShadow =
                                "0 8px 20px rgba(0,0,0,.25)";
                        }, onMouseLeave: (e) => {
                            // e.currentTarget.style.background = "#1a1a1a";
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.boxShadow =
                                "0 3px 10px rgba(0,0,0,.18)";
                        }, onMouseDown: (e) => e.stopPropagation(), onClick: Reset, style: {
                            width: "23px",
                            height: "23px",
                            borderRadius: "50%",
                            // background:
                            //   "#852828",
                            // border:
                            //   "1px solid rgba(255,255,255,0.07)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: "#777",
                            // boxShadow:
                            //   "0 4px 10px rgba(0,0,0,0.4)",
                        }, children: _jsx(X, { style: { cursor: 'pointer' }, color: 'white', strokeWidth: 3, size: 18 }) }) }) }) : '', _jsxs("div", { ref: popupRef, style: {
                    position: "fixed",
                    top: "38px",
                    right: "91px",
                    zIndex: 2147483645,
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                }, children: [open && (_jsxs("div", { onMouseDown: (e) => e.stopPropagation(), style: {
                            position: "fixed",
                            bottom: "76px",
                            right: "30px",
                            width: "255px",
                            background: "#161616",
                            borderRadius: "18px",
                            padding: "14px",
                            border: "1px solid rgba(255,255,255,0.07)",
                            boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "14px",
                            animation: "ss-popIn .22s cubic-bezier(0.34,1.56,0.64,1)",
                            transformOrigin: "top",
                        }, children: [_jsxs("div", { style: boxStyle, children: [_jsxs("div", { style: labelStyle, children: [_jsx("span", { children: "Grayscale" }), _jsxs("span", { children: [grayscale, "%"] })] }), _jsx("input", { type: "range", min: 0, max: 100, value: grayscale, onChange: (e) => {
                                            const v = Number(e.target
                                                .value);
                                            setGrayscale(v);
                                            applyFilters(v);
                                        }, style: sliderStyle })] }), _jsxs("div", { style: boxStyle, children: [_jsxs("div", { style: labelStyle, children: [_jsx("span", { children: "Blur" }), _jsxs("span", { children: [blur, "px"] })] }), _jsx("input", { type: "range", min: 0, max: 20, value: blur, onChange: (e) => {
                                            const v = Number(e.target
                                                .value);
                                            setBlur(v);
                                            applyFilters(grayscale, hueRotate, invert, v, contrast);
                                        }, style: sliderStyle })] }), _jsxs("button", { onMouseEnter: (e) => {
                                    // e.currentTarget.style.background = "#222";
                                    e.currentTarget.style.transform = "scale(1.06)";
                                    e.currentTarget.style.boxShadow =
                                        "0 8px 20px rgba(0,0,0,.25)";
                                }, onMouseLeave: (e) => {
                                    // e.currentTarget.style.background = "#1a1a1a";
                                    e.currentTarget.style.transform = "scale(1)";
                                    e.currentTarget.style.boxShadow =
                                        "0 3px 10px rgba(0,0,0,.18)";
                                }, onMouseDown: (e) => {
                                    // e.currentTarget.style.background = "#111";
                                    e.currentTarget.style.transform = "scale(0.96)";
                                    e.currentTarget.style.boxShadow =
                                        "inset 0 3px 8px rgba(0,0,0,.4)";
                                }, onMouseUp: (e) => {
                                    // e.currentTarget.style.background = "#222";
                                    e.currentTarget.style.transform = "scale(1.02)";
                                    e.currentTarget.style.boxShadow =
                                        "0 8px 20px rgba(0,0,0,.25)";
                                }, onClick: SelectAreaFn, style: {
                                    height: "38px",
                                    borderRadius: "12px",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    background: "#1e1e1e",
                                    color: "#d8d8d8",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                }, children: [_jsx(SquareDashed, { size: 16 }), "Select Area"] })] })), _jsx("div", { style: {
                            display: "flex",
                            justifyContent: "flex-end",
                        }, children: _jsx(Tippy, { content: _jsx("span", { style: {
                                    color: "#EAEAEA",
                                    fontSize: "16px",
                                    fontWeight: 500,
                                    letterSpacing: "0.2px",
                                    background: "#1E1E1E",
                                    padding: "7px 11px",
                                    borderRadius: "10px",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                    boxShadow: "0 8px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.03)",
                                }, children: "More..." }), animation: "shift-away-subtle", duration: [160, 110], delay: [120, 0], placement: "top", offset: [10, 10], zIndex: 9999, appendTo: (ref) => {
                                const root = ref.getRootNode();
                                if (root instanceof ShadowRoot) {
                                    return root; // 👈 safe cast for Tippy
                                }
                                return document.body;
                            }, children: _jsx("div", { onMouseEnter: (e) => {
                                    // e.currentTarget.style.background = "#222";
                                    e.currentTarget.style.transform = "scale(1.06)";
                                    e.currentTarget.style.boxShadow =
                                        "0 8px 20px rgba(0,0,0,.25)";
                                }, onMouseLeave: (e) => {
                                    // e.currentTarget.style.background = "#1a1a1a";
                                    e.currentTarget.style.transform = "scale(1)";
                                    e.currentTarget.style.boxShadow =
                                        "0 3px 10px rgba(0,0,0,.18)";
                                }, onMouseDown: (e) => e.stopPropagation(), onClick: () => setOpen((p) => !p), style: {
                                    width: "30px",
                                    height: "30px",
                                    borderRadius: "50%",
                                    // background:
                                    //   "#191919",
                                    // border:
                                    //   "1px solid rgba(255,255,255,0.07)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    color: "#777",
                                    // boxShadow:
                                    //   "0 4px 10px rgba(0,0,0,0.4)",
                                }, children: _jsx(ChevronUp, { size: 13, style: {
                                        transition: "transform 0.25s",
                                        transform: open
                                            ? "rotate(0deg)"
                                            : "rotate(180deg)",
                                    } }) }) }) })] })] }));
};
const boxStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
};
const labelStyle = {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "#cfcfcf",
};
const sliderStyle = {
    width: "100%",
    height: "4px",
    accentColor: "#888",
    cursor: "pointer",
};
export default Home;
