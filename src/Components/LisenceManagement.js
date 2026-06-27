import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { baseURL, baseColor } from "../UI-Models/Constant";
import { Trash2, Check, X } from "lucide-react";
const t = {
    bg: "#0c0c0d",
    card: "#141415",
    surface: "#1c1c1e",
    border: "rgba(255,255,255,0.08)",
    borderHover: "rgba(255,255,255,0.14)",
    text: "#f5f5f7",
    sub: "#6e6e73",
    sub2: "#48484e",
    green: "#34c759",
    greenBg: "rgba(52,199,89,0.1)",
    greenBorder: "rgba(52,199,89,0.22)",
    red: "#ff453a",
    redBg: "rgba(255,69,58,0.1)",
    redBorder: "rgba(255,69,58,0.2)",
    amber: "#ff9f0a",
    amberBg: "rgba(255,159,10,0.08)",
    amberBorder: "rgba(255,159,10,0.2)",
    disabled: "rgba(255,255,255,0.12)",
};
const MAX_DEVICES = 2;
const LicenseManagement = () => {
    const [licenseKey, setLicenseKey] = useState("");
    const [activeKey, setActiveKey] = useState(null);
    const [loading, setLoading] = useState("idle");
    const [removingSlot, setRemovingSlot] = useState(null);
    const [blockedDevices, setBlockedDevices] = useState([]);
    const [status, setStatus] = useState({
        visible: false, type: "success", title: "", body: "",
    });
    const [deviceId] = useState("Device-" + Math.random().toString(36).slice(2, 7).toUpperCase());
    /* ── derived booleans — no inline comparisons ── */
    const isBusy = loading !== "idle" || removingSlot !== null;
    const isActivating = loading === "activate";
    const isRemoving = loading === "remove";
    const isOverLimit = blockedDevices.length >= MAX_DEVICES;
    /* ── chrome storage ── */
    useEffect(() => {
        var _a;
        (_a = chrome === null || chrome === void 0 ? void 0 : chrome.storage) === null || _a === void 0 ? void 0 : _a.local.get(["active-license"], (res) => {
            if (res["active-license"])
                setActiveKey(res["active-license"]);
        });
    }, []);
    useEffect(() => {
        var _a;
        if (!((_a = chrome === null || chrome === void 0 ? void 0 : chrome.storage) === null || _a === void 0 ? void 0 : _a.local))
            return;
        if (activeKey)
            chrome.storage.local.set({ "active-license": activeKey });
        else
            chrome.storage.local.remove("active-license");
    }, [activeKey]);
    /* ── helpers ── */
    const formatKey = (v) => {
        var _a, _b;
        return (_b = (_a = v.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 16)
            .match(/.{1,4}/g)) === null || _a === void 0 ? void 0 : _a.join("-")) !== null && _b !== void 0 ? _b : "";
    };
    const showStatus = (type, title, body) => setStatus({ visible: true, type, title, body });
    const dismissStatus = () => setStatus((s) => (Object.assign(Object.assign({}, s), { visible: false })));
    const maskedKey = (key) => key.length > 9 ? `${key.slice(0, 4)}…${key.slice(-4)}` : key;
    const clientName = (ua) => {
        const a = ua.toLowerCase();
        if (a.includes("thunder client"))
            return "Thunder Client";
        if (a.includes("edg"))
            return "Microsoft Edge";
        if (a.includes("chrome"))
            return "Chrome";
        if (a.includes("firefox"))
            return "Firefox";
        if (a.includes("safari") && !a.includes("chrome"))
            return "Safari";
        if (a.includes("opera") || a.includes("opr"))
            return "Opera";
        if (a.includes("postman"))
            return "Postman";
        return "Unknown device";
    };
    /* ── activate ── */
    const activateLicense = async () => {
        if (!licenseKey.trim()) {
            showStatus("error", "No key entered", "Enter a 16-character license key to continue.");
            return;
        }
        try {
            setLoading("activate");
            setBlockedDevices([]);
            const res = await fetch(`${baseURL}/activate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ licenseKey, deviceId }),
            });
            const data = await res.json();
            if (res.ok) {
                setActiveKey(licenseKey);
                showStatus("success", "License activated", "Orpheus is now active on this device.");
            }
            else {
                setBlockedDevices(data.activatedDevices || []);
                setActiveKey(licenseKey);
                showStatus("error", "Device limit reached", data.message || "Remove a device below to free up a slot.");
            }
        }
        catch (_a) {
            showStatus("error", "Connection failed", "Check your internet and try again.");
        }
        finally {
            setLoading("idle");
        }
    };
    /* ── remove local license ── */
    const removeLocalLicense = async () => {
        try {
            setLoading("remove");
            await new Promise((r) => setTimeout(r, 700));
            setActiveKey(null);
            setLicenseKey("");
            setBlockedDevices([]);
            showStatus("success", "License removed", "Orpheus has been deactivated on this device.");
        }
        finally {
            setLoading("idle");
        }
    };
    /* ── remove one device slot ── */
    const removeServerSlot = async (time) => {
        try {
            setRemovingSlot(time);
            const res = await fetch(`${baseURL}/deactivate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ licenseKey, time }),
            });
            const data = await res.json();
            if (res.ok) {
                setBlockedDevices(data.remaining || []);
                showStatus("success", "Device removed", "That device slot has been freed.");
            }
            else {
                showStatus("error", "Removal failed", data.message || "Try again.");
            }
        }
        catch (_a) {
            showStatus("error", "Connection failed", "Check your internet and try again.");
        }
        finally {
            setRemovingSlot(null);
        }
    };
    /* ── spinner ── */
    const Spinner = ({ color = "rgba(255,255,255,0.9)", track = "rgba(255,255,255,0.2)", size = 13, }) => (_jsx("span", { style: {
            width: size, height: size, flexShrink: 0,
            border: `2px solid ${track}`,
            borderTop: `2px solid ${color}`,
            borderRadius: "50%",
            display: "inline-block",
            animation: "lm-spin 0.65s linear infinite",
        } }));
    /* ── shared hover scale handlers ── */
    const scale = {
        onMouseEnter: (e) => {
            if (!e.currentTarget.disabled)
                e.currentTarget.style.transform = "scale(1.04)";
        },
        onMouseLeave: (e) => {
            e.currentTarget.style.transform = "scale(1)";
        },
        onMouseDown: (e) => {
            e.stopPropagation();
            if (!e.currentTarget.disabled)
                e.currentTarget.style.transform = "scale(0.96)";
        },
        onMouseUp: (e) => {
            if (!e.currentTarget.disabled)
                e.currentTarget.style.transform = "scale(1.02)";
        },
    };
    /* ════════════════════════════════════════════ */
    return (_jsxs("div", { style: {
            background: t.bg,
            display: "flex",
            justifyContent: "center",
            padding: 20,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
        }, children: [_jsx("style", { children: `
        @keyframes lm-spin { to { transform: rotate(360deg); } }
        @keyframes lm-pop  { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }
        @keyframes lm-fade { from { opacity:0; } to { opacity:1; } }
      ` }), _jsxs("div", { style: {
                    width: "100%", maxWidth: 380, position: "relative",
                    background: t.card, border: `1px solid ${t.border}`,
                    borderRadius: 20, padding: 22,
                }, children: [_jsxs("div", { style: {
                            display: "flex", alignItems: "center",
                            justifyContent: "space-between", marginBottom: 18,
                        }, children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [_jsx("svg", { width: "17", height: "17", viewBox: "0 0 24 24", fill: "none", children: _jsx("path", { d: "M8.6 22.5L6.7 19.3L3.1 18.5L3.45 14.8L1 12L3.45 9.2L3.1 5.5L6.7 4.7L8.6 1.5L12 2.95L15.4 1.5L17.3 4.7L20.9 5.5L20.55 9.2L23 12L20.55 14.8L20.9 18.5L17.3 19.3L15.4 22.5L12 21.05L8.6 22.5ZM10.95 15.55L16.6 9.9L15.2 8.45L10.95 12.7L8.8 10.6L7.4 12L10.95 15.55Z", fill: "#C67100" }) }), _jsx("span", { style: { fontSize: 14, fontWeight: 700, color: t.text }, children: "Orpheus" })] }), _jsx("span", { style: { fontSize: 11, color: t.sub }, children: "License" })] }), !activeKey && (_jsxs(_Fragment, { children: [_jsx("div", { style: {
                                    fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
                                    textTransform: "uppercase", color: t.sub, marginBottom: 9,
                                }, children: "License key" }), _jsx("input", { value: licenseKey, onChange: (e) => setLicenseKey(e.target.value), placeholder: "XXXX-XXXX-XXXX-XXXX", disabled: isBusy, style: {
                                    width: "100%", boxSizing: "border-box",
                                    background: t.surface, border: `1px solid ${t.border}`,
                                    borderRadius: 12, color: t.text,
                                    fontSize: 14, letterSpacing: "0.12em",
                                    fontFamily: "'SF Mono', 'Fira Code', monospace",
                                    padding: "11px 14px", textAlign: "center",
                                    outline: "none", marginBottom: 10,
                                } }), _jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }, children: [_jsx("button", Object.assign({}, scale, { onClick: activateLicense, disabled: isBusy, style: {
                                            border: "none", borderRadius: 12, padding: "11px 16px",
                                            fontWeight: 600, cursor: isBusy ? "not-allowed" : "pointer",
                                            fontSize: 13, letterSpacing: "0.01em",
                                            background: isBusy ? t.disabled : baseColor,
                                            color: "#000",
                                            display: "flex", alignItems: "center",
                                            justifyContent: "center", gap: 7,
                                            transition: "transform 0.15s",
                                        }, children: isActivating
                                            ? _jsxs(_Fragment, { children: [_jsx(Spinner, { color: "rgba(0,0,0,0.8)", track: "rgba(0,0,0,0.15)" }), " Activating"] })
                                            : "Activate" })), _jsx("button", Object.assign({}, scale, { style: {
                                            border: `1px solid ${t.border}`, borderRadius: 12,
                                            padding: "11px 16px", fontWeight: 600, cursor: "pointer",
                                            fontSize: 13, letterSpacing: "0.01em",
                                            background: t.surface, color: t.sub,
                                            display: "flex", alignItems: "center",
                                            justifyContent: "center", gap: 7,
                                            transition: "transform 0.15s",
                                        }, children: "Buy license" }))] })] })), activeKey && (_jsxs(_Fragment, { children: [_jsxs("div", { style: {
                                    display: "flex", alignItems: "center",
                                    justifyContent: "space-between",
                                    background: t.surface, border: `1px solid ${t.border}`,
                                    borderRadius: 12, padding: "12px 14px", marginBottom: 14,
                                }, children: [_jsxs("div", { children: [_jsx("div", { style: {
                                                    fontSize: 13, fontWeight: 600, color: t.text,
                                                    fontFamily: "'SF Mono','Fira Code',monospace",
                                                    letterSpacing: "0.1em",
                                                }, children: maskedKey(activeKey) }), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, marginTop: 5 }, children: [_jsxs("div", { style: {
                                                            display: "flex", alignItems: "center", gap: 4,
                                                            background: t.greenBg, border: `1px solid ${t.greenBorder}`,
                                                            borderRadius: 5, padding: "2px 7px",
                                                            fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
                                                            color: t.green, textTransform: "uppercase",
                                                        }, children: [_jsx("div", { style: { width: 5, height: 5, borderRadius: "50%", background: t.green } }), "Active"] }), _jsx("span", { style: { fontSize: 10, color: t.sub }, children: "This device" })] })] }), _jsx("button", { onClick: removeLocalLicense, disabled: isBusy, "aria-label": "Remove license from this device", style: {
                                            width: 30, height: 30, borderRadius: 8, border: "none",
                                            cursor: isBusy ? "not-allowed" : "pointer", flexShrink: 0,
                                            background: isRemoving ? t.redBg : "transparent",
                                            color: isRemoving ? t.red : t.sub,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            transition: "background 0.15s, color 0.15s, transform 0.15s",
                                        }, onMouseEnter: (e) => {
                                            if (!isBusy) {
                                                e.currentTarget.style.background = t.redBg;
                                                e.currentTarget.style.color = t.red;
                                                e.currentTarget.style.transform = "scale(1.12)";
                                            }
                                        }, onMouseLeave: (e) => {
                                            if (!isRemoving) {
                                                e.currentTarget.style.background = "transparent";
                                                e.currentTarget.style.color = t.sub;
                                            }
                                            e.currentTarget.style.transform = "scale(1)";
                                        }, onMouseDown: (e) => {
                                            e.stopPropagation();
                                            if (!isBusy)
                                                e.currentTarget.style.transform = "scale(0.9)";
                                        }, onMouseUp: (e) => {
                                            if (!isBusy)
                                                e.currentTarget.style.transform = "scale(1.06)";
                                        }, children: isRemoving
                                            ? _jsx(Spinner, { color: t.red, track: t.redBg, size: 12 })
                                            : _jsx(Trash2, { size: 14 }) })] }), isOverLimit && blockedDevices.length > 0 && (_jsxs("div", { style: {
                                    display: "flex", alignItems: "center", gap: 8,
                                    padding: "8px 12px", borderRadius: 10, marginBottom: 10,
                                    background: t.amberBg, border: `1px solid ${t.amberBorder}`,
                                    fontSize: 12, fontWeight: 600, color: t.amber,
                                }, children: [_jsxs("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" }), _jsx("line", { x1: "12", y1: "9", x2: "12", y2: "13" }), _jsx("line", { x1: "12", y1: "17", x2: "12.01", y2: "17" })] }), "Device limit reached (", blockedDevices.length, "/", MAX_DEVICES, ") \u2014 remove one below"] })), blockedDevices.map((d, i) => {
                                const isThisRemoving = removingSlot === d.time;
                                return (_jsxs("div", { style: {
                                        display: "flex", alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "9px 12px", borderRadius: 10,
                                        background: t.surface, border: `1px solid ${t.border}`,
                                        marginBottom: 7,
                                        opacity: isThisRemoving ? 0.5 : 1,
                                        transition: "opacity 0.2s",
                                    }, children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 9 }, children: [_jsx("div", { style: {
                                                        width: 28, height: 28, borderRadius: 7,
                                                        background: "rgba(255,255,255,0.06)",
                                                        display: "flex", alignItems: "center",
                                                        justifyContent: "center",
                                                        color: t.sub, fontSize: 14,
                                                    }, children: "\uD83D\uDDA5" }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: 12, fontWeight: 600, color: t.text }, children: clientName(d.userAgent) }), _jsx("div", { style: { fontSize: 11, color: t.sub, marginTop: 1 }, children: new Date(d.time).toLocaleDateString("en-US", {
                                                                month: "short", day: "numeric", year: "numeric",
                                                            }) })] })] }), _jsx("button", { onClick: () => { if (!isBusy)
                                                removeServerSlot(d.time); }, disabled: isBusy, "aria-label": `Remove ${clientName(d.userAgent)}`, style: {
                                                width: 28, height: 28, borderRadius: 8, border: "none",
                                                cursor: isBusy ? "not-allowed" : "pointer", flexShrink: 0,
                                                background: t.redBg, color: t.red,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                transition: "transform 0.15s, background 0.15s",
                                            }, onMouseEnter: (e) => {
                                                if (!isBusy) {
                                                    e.currentTarget.style.background = "rgba(255,69,58,0.22)";
                                                    e.currentTarget.style.transform = "scale(1.1)";
                                                }
                                            }, onMouseLeave: (e) => {
                                                e.currentTarget.style.background = t.redBg;
                                                e.currentTarget.style.transform = "scale(1)";
                                            }, onMouseDown: (e) => {
                                                e.stopPropagation();
                                                if (!isBusy)
                                                    e.currentTarget.style.transform = "scale(0.9)";
                                            }, onMouseUp: (e) => {
                                                if (!isBusy)
                                                    e.currentTarget.style.transform = "scale(1.06)";
                                            }, children: isThisRemoving
                                                ? _jsx(Spinner, { color: t.red, track: t.redBg, size: 12 })
                                                : _jsx(Trash2, { size: 13 }) })] }, i));
                            })] })), status.visible && (_jsx("div", { style: {
                            position: "absolute", inset: 0,
                            background: "rgba(0,0,0,0.65)",
                            borderRadius: 20,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            zIndex: 10,
                            animation: "lm-fade 0.15s",
                        }, children: _jsxs("div", { style: {
                                background: t.card, border: `1px solid ${t.borderHover}`,
                                borderRadius: 16, padding: "22px 22px 18px",
                                width: 256, textAlign: "center",
                                animation: "lm-pop 0.2s cubic-bezier(0.16,1,0.3,1)",
                            }, children: [_jsx("div", { style: {
                                        width: 46, height: 46, borderRadius: "50%",
                                        background: status.type === "success" ? t.greenBg : t.redBg,
                                        border: `1px solid ${status.type === "success" ? t.greenBorder : t.redBorder}`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        margin: "0 auto 14px",
                                        color: status.type === "success" ? t.green : t.red,
                                    }, children: status.type === "success"
                                        ? _jsx(Check, { size: 22, strokeWidth: 2.5 })
                                        : _jsx(X, { size: 22, strokeWidth: 2.5 }) }), _jsx("div", { style: { fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 6 }, children: status.title }), _jsx("div", { style: { fontSize: 12, color: t.sub, lineHeight: 1.55, marginBottom: 18 }, children: status.body }), _jsx("button", { onClick: dismissStatus, style: {
                                        width: "100%", padding: 10, borderRadius: 10,
                                        border: "none", cursor: "pointer",
                                        fontSize: 13, fontWeight: 600,
                                        background: status.type === "success" ? t.green : t.red,
                                        color: status.type === "success" ? "#000" : "#fff",
                                        transition: "transform 0.15s, opacity 0.15s",
                                    }, onMouseEnter: (e) => {
                                        e.currentTarget.style.transform = "scale(1.02)";
                                        e.currentTarget.style.opacity = "0.9";
                                    }, onMouseLeave: (e) => {
                                        e.currentTarget.style.transform = "scale(1)";
                                        e.currentTarget.style.opacity = "1";
                                    }, onMouseDown: (e) => { e.currentTarget.style.transform = "scale(0.97)"; }, onMouseUp: (e) => { e.currentTarget.style.transform = "scale(1.01)"; }, children: "Got it" })] }) }))] })] }));
};
export default LicenseManagement;
