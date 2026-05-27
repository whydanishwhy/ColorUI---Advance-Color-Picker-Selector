import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import LisenceManagement from './LisenceManagement';
import Switch from '../UI-Models/Switch';
import { baseColor } from '../UI-Models/Constant';
const Setting = () => {
    const modes = ["RGB", "HEX", "HSL"];
    const [selected, setSelected] = useState("RGB");
    const [disabledOnMedia, setDisabledOnMedia] = useState(false);
    const [openPickerOnRun, setOpenPickerOnRun] = useState(false);
    // Load saved values
    useEffect(() => {
        chrome.storage.local.get(["colorMode", "disabledOnMedia", "openPickerOnRun"], (result) => {
            var _a, _b, _c;
            setSelected((_a = result.colorMode) !== null && _a !== void 0 ? _a : "RGB");
            setDisabledOnMedia((_b = result.disabledOnMedia) !== null && _b !== void 0 ? _b : false);
            setOpenPickerOnRun((_c = result.openPickerOnRun) !== null && _c !== void 0 ? _c : false);
        });
    }, []);
    // Save whenever anything changes
    useEffect(() => {
        chrome.storage.local.set({
            colorMode: selected,
            disabledOnMedia,
            openPickerOnRun,
        });
    }, [selected, disabledOnMedia, openPickerOnRun]);
    return (_jsxs("div", { style: {
            animation: "ss-popIn .22s cubic-bezier(0.34,1.56,0.64,1)",
            transformOrigin: "left",
        }, children: [_jsx(LisenceManagement, {}), _jsxs("div", { children: [_jsxs("div", { style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '20px',
                            alignItems: 'center'
                        }, children: [_jsx("div", { children: "Disable Effect on Media :" }), _jsx(Switch, { color: baseColor, checked: disabledOnMedia, onChange: () => setDisabledOnMedia(prev => !prev) })] }), _jsxs("div", { style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '20px',
                            alignItems: 'center'
                        }, children: [_jsx("div", { children: "open Picker on run :" }), _jsx(Switch, { color: baseColor, checked: openPickerOnRun, onChange: () => setOpenPickerOnRun(prev => !prev) })] })] }), _jsxs("div", { style: {
                    width: "300px",
                    padding: "24px",
                    borderRadius: "16px",
                    background: "#181818",
                    color: "white",
                    fontFamily: "sans-serif"
                }, children: [_jsx("h3", { style: {
                            marginBottom: "18px"
                        }, children: "Color Format" }), _jsx("div", { style: {
                            display: "flex",
                            gap: "12px"
                        }, children: modes.map((mode) => (_jsxs("label", { style: {
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                cursor: "pointer",
                                padding: "10px 14px",
                                // border:
                                //   selected === mode
                                //     ? "1px solid #7c3aed"
                                //     : "1px solid #333",
                                borderRadius: "12px",
                                transition: "0.3s",
                                // background:
                                //   selected === mode
                                //     ? "#2a1e45"
                                //     : "#222"
                            }, children: [_jsx("input", { type: "radio", name: "colorMode", value: mode, checked: selected === mode, onChange: () => setSelected(mode), style: {
                                        display: "none"
                                    } }), _jsx("span", { style: {
                                        width: "14px",
                                        height: "14px",
                                        border: selected === mode
                                            ? `2px solid ${baseColor}`
                                            : "2px solid #666",
                                        borderRadius: "50%",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center"
                                    }, children: _jsx("span", { style: {
                                            width: "8px",
                                            height: "8px",
                                            borderRadius: "50%",
                                            background: baseColor,
                                            transition: "0.3s",
                                            opacity: selected === mode ? 1 : 0
                                        } }) }), mode] }, mode))) })] })] }));
};
export default Setting;
