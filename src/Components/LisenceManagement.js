import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { baseURL } from "../UI-Models/Constant";
import { Trash2 } from "lucide-react";
import { baseColor } from "../UI-Models/Constant";
const LicenseManagement = () => {
    const theme = {
        bg: "#0f0f10",
        card: "#171718",
        soft: "#1d1d1f",
        border: "#2b2b2e",
        text: "#ffffff",
        sub: "#8f8f95",
        green: "#49d17c",
        red: "#ff5e5e",
        accent: "#3B9D55",
        disabled: "#3a3a3f",
    };
    const MAX_DEVICES = 2;
    const [licenseKey, setLicenseKey] = useState("");
    const [activeKey, setActiveKey] = useState(null);
    const [deviceId] = useState("Device-" + Math.random().toString(36).slice(2, 7).toUpperCase());
    const [loading, setLoading] = useState("idle");
    // ── per-device spinner: stores the `time` string of the slot being removed ──
    const [removingSlot, setRemovingSlot] = useState(null);
    const [blockedDevices, setBlockedDevices] = useState([]);
    const [status, setStatus] = useState({ type: "idle", text: "" });
    // ref so we can cancel the auto-clear timer on fast re-triggers
    const statusTimerRef = useRef(null);
    const isBusy = loading !== "idle" || removingSlot !== null;
    /* ── auto-dismiss status after 3.5 s ── */
    const showStatus = (type, text) => {
        if (statusTimerRef.current)
            clearTimeout(statusTimerRef.current);
        setStatus({ type, text });
        statusTimerRef.current = setTimeout(() => setStatus({ type: "idle", text: "" }), 3500);
    };
    useEffect(() => () => {
        if (statusTimerRef.current)
            clearTimeout(statusTimerRef.current);
    }, []);
    /* ── chrome storage sync ── */
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
        if (activeKey) {
            chrome.storage.local.set({ "active-license": activeKey });
        }
        else {
            chrome.storage.local.remove("active-license");
        }
    }, [activeKey]);
    const formatKey = (value) => {
        var _a;
        return ((_a = value
            .replace(/[^a-zA-Z0-9]/g, "")
            .toUpperCase()
            .slice(0, 16)
            .match(/.{1,4}/g)) === null || _a === void 0 ? void 0 : _a.join("-")) || "";
    };
    /* ── activate ── */
    const activateLicense = async () => {
        if (!licenseKey.trim()) {
            showStatus("error", "Enter license key.");
            return;
        }
        try {
            setLoading("activate");
            // clear stale device list so it doesn't show during a fresh attempt
            setBlockedDevices([]);
            setStatus({ type: "idle", text: "" });
            const res = await fetch(`${baseURL}/activate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ licenseKey, deviceId }),
            });
            const data = await res.json();
            if (res.ok) {
                setActiveKey(licenseKey);
                showStatus("success", "License activated successfully.");
            }
            else {
                showStatus("error", data.message || "Activation failed.");
                setBlockedDevices(data.activatedDevices || []);
            }
        }
        catch (_a) {
            showStatus("error", "Server error.");
        }
        finally {
            setLoading("idle");
        }
    };
    /* ── remove license locally ── */
    const removeLocalLicense = async () => {
        try {
            setLoading("remove");
            setStatus({ type: "idle", text: "" });
            await new Promise((r) => setTimeout(r, 700));
            setActiveKey(null);
            setLicenseKey("");
            setBlockedDevices([]);
            showStatus("success", "License removed from device.");
        }
        finally {
            setLoading("idle");
        }
    };
    /* ── remove one device slot (with per-row spinner) ── */
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
                showStatus("success", "Device removed successfully.");
            }
            else {
                showStatus("error", data.message || "Failed.");
            }
        }
        catch (_a) {
            showStatus("error", "Server error.");
        }
        finally {
            setRemovingSlot(null);
        }
    };
    /* ── spinner ── */
    const Spinner = ({ dark = false }) => (_jsx("span", { style: {
            width: 14,
            height: 14,
            border: dark
                ? "2px solid rgba(0,0,0,0.2)"
                : "2px solid rgba(255,255,255,0.15)",
            borderTop: dark
                ? "2px solid rgba(0,0,0,0.9)"
                : "2px solid rgba(255,255,255,0.8)",
            borderRadius: "50%",
            display: "inline-block",
            animation: "spin 0.7s linear infinite",
            flexShrink: 0,
        } }));
    const getClientName = (ua) => {
        const agent = ua.toLowerCase();
        if (agent.includes("thunder client"))
            return "Thunder Client";
        if (agent.includes("edg"))
            return "Microsoft Edge";
        if (agent.includes("chrome"))
            return "Chrome";
        if (agent.includes("firefox"))
            return "Firefox";
        if (agent.includes("safari") && !agent.includes("chrome"))
            return "Safari";
        if (agent.includes("opera") || agent.includes("opr"))
            return "Opera";
        if (agent.includes("postman"))
            return "Postman";
        return "Unknown Device";
    };
    const isOverLimit = blockedDevices.length > MAX_DEVICES;
    const btn = {
        border: "none",
        borderRadius: 14,
        padding: "13px 16px",
        fontWeight: 700,
        cursor: "pointer",
        fontSize: 14,
        transition: "transform 0.2s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    };
    const hoverScale = {
        onMouseEnter: (e) => (e.currentTarget.style.transform = "scale(1.06)"),
        onMouseLeave: (e) => (e.currentTarget.style.transform = "scale(1)"),
        onMouseDown: (e) => {
            e.stopPropagation();
            e.currentTarget.style.transform = "scale(0.96)";
        },
        onMouseUp: (e) => (e.currentTarget.style.transform = "scale(1.02)"),
    };
    return (_jsx("div", { style: {
            background: theme.bg,
            display: "flex",
            justifyContent: "center",
            padding: 20,
            fontFamily: "Inter",
        }, children: _jsxs("div", { style: {
                width: "100%",
                maxWidth: 420,
                background: theme.card,
                border: `1px solid ${theme.border}`,
                borderRadius: 24,
                padding: 26,
            }, children: [activeKey && (_jsx("div", { style: {
                        padding: 16,
                        borderRadius: 14,
                        marginBottom: 16,
                    }, children: _jsxs("div", { style: {
                            color: theme.text,
                            fontWeight: 700,
                            letterSpacing: 2,
                            marginTop: 6,
                            textAlign: "center",
                        }, children: [_jsxs("div", { style: {
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "7px",
                                }, children: [_jsx("div", { style: { fontSize: "15px", color: "gray" }, children: "Orpheus" }), _jsx("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { d: "M8.6 22.5L6.7 19.3L3.1 18.5L3.45 14.8L1 12L3.45 9.2L3.1 5.5L6.7 4.7L8.6 1.5L12 2.95L15.4 1.5L17.3 4.7L20.9 5.5L20.55 9.2L23 12L20.55 14.8L20.9 18.5L17.3 19.3L15.4 22.5L12 21.05L8.6 22.5ZM10.95 15.55L16.6 9.9L15.2 8.45L10.95 12.7L8.8 10.6L7.4 12L10.95 15.55Z", fill: "#C67100" }) })] }), activeKey.length > 8
                                ? `${activeKey.slice(0, 4)}...${activeKey.slice(-4)}`
                                : activeKey] }) })), !activeKey && (_jsxs(_Fragment, { children: [_jsx("h2", { style: { color: theme.text }, children: "Activate License" }), _jsx("input", { value: licenseKey, onChange: (e) => setLicenseKey(e.target.value), placeholder: "XXXX-XXXX-XXXX-XXXX", disabled: isBusy, style: {
                                width: "100%",
                                marginTop: 12,
                                padding: 12,
                                borderRadius: 14,
                                background: theme.soft,
                                border: `1px solid ${theme.border}`,
                                color: theme.text,
                                textAlign: "center",
                                letterSpacing: 2,
                                boxSizing: "border-box",
                            } }), _jsxs("div", { style: {
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 10,
                                marginTop: 16,
                            }, children: [_jsx("button", Object.assign({}, hoverScale, { onClick: activateLicense, disabled: isBusy, style: Object.assign(Object.assign({}, btn), { background: isBusy ? theme.disabled : baseColor, color: "#000" }), children: loading === "activate" ? (_jsxs(_Fragment, { children: [_jsx(Spinner, { dark: true }), " Activating"] })) : ("Activate") })), _jsx("button", Object.assign({}, hoverScale, { style: Object.assign(Object.assign({}, btn), { background: theme.soft, color: theme.sub, border: `1px solid ${theme.border}` }), children: "Buy" }))] })] })), activeKey && isOverLimit && (_jsxs("div", { style: {
                        marginTop: 16,
                        padding: 12,
                        borderRadius: 12,
                        background: "rgba(255,94,94,0.08)",
                        border: "1px solid rgba(255,94,94,0.2)",
                        color: theme.red,
                        fontWeight: 700,
                    }, children: ["\u26A0 Device limit exceeded (", blockedDevices.length, "/", MAX_DEVICES, ")"] })), blockedDevices.map((d, i) => {
                    const isThisRemoving = removingSlot === d.time;
                    return (_jsxs("div", { style: {
                            padding: "12px 14px",
                            borderRadius: 12,
                            background: theme.soft,
                            border: `1px solid ${theme.border}`,
                            marginBottom: 8,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            opacity: isThisRemoving ? 0.6 : 1,
                            transition: "opacity 0.2s",
                        }, children: [_jsxs("div", { children: [_jsx("div", { style: { color: theme.text, fontWeight: 600, fontSize: 13 }, children: getClientName(d.userAgent) }), _jsx("div", { style: { color: theme.sub, fontSize: 11, marginTop: 2 }, children: new Date(d.time).toLocaleDateString() })] }), _jsx("button", Object.assign({ onClick: () => !isBusy && removeServerSlot(d.time), disabled: isBusy, style: {
                                    width: 34,
                                    height: 34,
                                    borderRadius: 10,
                                    border: "none",
                                    cursor: isBusy ? "not-allowed" : "pointer",
                                    background: isThisRemoving
                                        ? "rgba(255,94,94,0.06)"
                                        : "rgba(255,94,94,0.12)",
                                    color: theme.red,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "transform 0.15s",
                                } }, (!isBusy ? hoverScale : {}), { children: isThisRemoving ? (_jsx(Spinner, {})) : (_jsx(Trash2, { size: 16 })) }))] }, i));
                }), activeKey && (_jsx("button", Object.assign({}, (!isBusy ? hoverScale : {}), { onClick: removeLocalLicense, disabled: isBusy, style: Object.assign(Object.assign({}, btn), { width: "100%", marginTop: 18, background: loading === "remove" ? theme.disabled : theme.red, color: "#fff", cursor: isBusy ? "not-allowed" : "pointer" }), children: loading === "remove" ? (_jsxs(_Fragment, { children: [_jsx(Spinner, {}), " Removing License"] })) : (_jsx(Trash2, { size: 18 })) }))), status.text && (_jsx("div", { style: {
                        marginTop: 16,
                        padding: 12,
                        borderRadius: 12,
                        background: status.type === "success"
                            ? "rgba(73,209,124,0.1)"
                            : "rgba(255,94,94,0.1)",
                        color: status.type === "success" ? theme.green : theme.red,
                        fontWeight: 600,
                        animation: "fadeStatus 3.5s forwards",
                    }, children: status.text }, status.text + Date.now())), _jsx("style", { children: `
          @keyframes spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          @keyframes fadeStatus {
            0%   { opacity: 1; }
            70%  { opacity: 1; }
            100% { opacity: 0; }
          }
        ` })] }) }));
};
export default LicenseManagement;
