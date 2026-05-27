import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
const Notepad = () => {
    const [msg, setMsg] = useState("");
    useEffect(() => {
        var _a;
        const host = document.getElementById("__EXT_HOST__");
        const container = (_a = host === null || host === void 0 ? void 0 : host.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector("div");
        if (container) {
            container.style.width = '600px';
            container.style.height = '600px';
        }
        return () => {
            var _a;
            const host = document.getElementById("__EXT_HOST__");
            const container = (_a = host === null || host === void 0 ? void 0 : host.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector("div");
            if (container) {
                container.style.width = '350px';
                container.style.height = '400px';
            }
        };
    }, []);
    useEffect(() => {
        const handleCopy = async (e) => {
            try {
                // Read the current clipboard text
                const text = await navigator.clipboard.readText();
                // Append it to the message box
                setMsg(prev => (prev ? prev + "\n" + text : text));
            }
            catch (err) {
                console.error("Failed to read clipboard:", err);
            }
        };
        document.addEventListener("copy", handleCopy);
        return () => {
            document.removeEventListener("copy", handleCopy);
        };
    }, []);
    return (_jsx("div", { style: { padding: "20px", fontFamily: "sans-serif" }, children: _jsx("div", { id: "MsgBox", contentEditable: true, style: {
                marginTop: "20px",
                padding: "10px",
                border: "1px solid #ccc",
                minHeight: "100px",
                whiteSpace: "pre-wrap",
                background: "#242424",
                color: 'gray',
                borderRadius: '8px',
                overflowY: 'scroll'
            }, children: msg || "No text copied yet" }) }));
};
export default Notepad;
