import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import Tippy from '@tippyjs/react';
import { RotateCcw } from "lucide-react";
const Header = ({ active, isActive, setIsActive, setActive, setSettingPage, SettingPage }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isHovered2, setIsHovered2] = useState(false);
    const Close = () => {
        const host = document.getElementById("__EXT_HOST__");
        if (host) {
            host.style.display = 'none';
            document.documentElement.style.userSelect = '';
        }
    };
    // const Minimize = ()=>{
    //   const host = document.getElementById("__EXT_HOST__");
    //   if(host){
    //       host.style.display = 'none';
    //       document.documentElement.style.userSelect = ''
    //   }  
    //   const side = document.getElementById('__EXT__SIDEICON__');
    //   if(side){ return}
    //   const sideIcon = document.createElement('div');
    //   sideIcon.id = '__EXT__SIDEICON__'
    //   sideIcon.style.position = 'fixed';
    //   sideIcon.style.right = '0px';
    //   sideIcon.style.top = '50%'
    //   sideIcon.style.width = '40px'
    //   sideIcon.style.height = '40px'
    //   sideIcon.style.borderTopLeftRadius = '20px'
    //     sideIcon.style.borderBottomLeftRadius = '20px'
    //   sideIcon.style.background = '#121212'
    //   sideIcon.onclick = ()=>{
    //     document.getElementById('__EXT__SIDEICON__')?.remove();
    //     if(host){
    //       host.style.display = 'block';
    //       document.documentElement.style.userSelect = 'none'
    //   }  
    //   }
    //   document.body.appendChild(sideIcon);
    // }
    const Reset = () => {
        const customDiv = document.getElementById("custom-drawn-div");
        const customLayer = document.getElementById("custom-filter-layer");
        if (customDiv) {
            customDiv.style.backdropFilter = "none";
        }
        if (customLayer) {
            customLayer.style.backdropFilter = "none";
        }
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
    return (_jsxs("header", { id: "__CHROMALENS_HEADER__", style: { display: "flex", padding: '10px', width: '93%', alignItems: 'center', justifyContent: 'space-between' }, children: [SettingPage ? _jsx("svg", { onMouseEnter: (e) => {
                    e.currentTarget.style.transform = "scale(1.06)";
                    e.currentTarget.style.boxShadow =
                        "0 8px 20px rgba(0,0,0,.25)";
                }, onMouseLeave: (e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow =
                        "0 3px 10px rgba(0,0,0,.18)";
                }, onMouseDown: (e) => {
                    e.stopPropagation();
                    e.currentTarget.style.background = "#111";
                    e.currentTarget.style.transform = "scale(0.96)";
                    e.currentTarget.style.boxShadow =
                        "inset 0 3px 8px rgba(0,0,0,.4)";
                }, onMouseUp: (e) => {
                    e.currentTarget.style.background = "#222";
                    e.currentTarget.style.transform = "scale(1.02)";
                    e.currentTarget.style.boxShadow =
                        "0 8px 20px rgba(0,0,0,.25)";
                }, style: { cursor: 'pointer', border: 'none' }, onClick: () => setSettingPage(false), width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { d: "M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z", fill: "#626262" }) })
                :
                    _jsx("div", { style: { color: '#1b1b1b', userSelect: 'none' }, children: "." }), isActive ?
                //      <span>
                //       <Tippy content={<span style={{ color: "white", fontSize:'14px', borderRadius:'9px',fontWeight:'700', background:'#1b1b1b' , padding:'6px 10px'}}>Close</span>}   animation="fade"
                //   duration={[200, 150]}  placement="left" zIndex={9999}   appendTo={(ref) => {
                //     const root = ref.getRootNode();
                //     if (root instanceof ShadowRoot) {
                //       return root as unknown as Element; // 👈 safe cast for Tippy
                //     }
                //     return document.body;
                //   }} >
                // <X  size={20} color="gray" onClick={()=>{setIsActive(false)}}/>
                // </Tippy>
                //      </span>
                ''
                : _jsx("span", { children: 0 ?
                        _jsx(Tippy, { content: _jsx("span", { style: {
                                    color: "#EAEAEA",
                                    fontSize: "16px",
                                    fontWeight: 500,
                                    letterSpacing: "0.2px",
                                    background: "#1E1E1E",
                                    padding: "7px 11px",
                                    borderRadius: "10px",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                    boxShadow: "0 8px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.03)",
                                }, children: "ScreenShot" }), animation: "shift-away-subtle", duration: [160, 110], delay: [120, 0], placement: "top", offset: [10, 10], zIndex: 9999, appendTo: (ref) => {
                                const root = ref.getRootNode();
                                if (root instanceof ShadowRoot) {
                                    return root; // 👈 safe cast for Tippy
                                }
                                return document.body;
                            }, children: _jsx(RotateCcw, { style: { cursor: 'pointer' }, size: 20, color: "white", onClick: Reset }) })
                        : _jsxs("div", { style: { display: "flex", alignItems: 'center', gap: '10px' }, children: [_jsx(Tippy, { content: _jsx("span", { style: {
                                            color: "#EAEAEA",
                                            fontSize: "13px",
                                            fontWeight: 600,
                                            letterSpacing: "0.2px",
                                            background: "#1E1E1E",
                                            padding: "7px 11px",
                                            borderRadius: "10px",
                                            border: "1px solid rgba(255,255,255,0.06)",
                                            boxShadow: "0 8px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.03)",
                                        }, children: "Setting" }), animation: "shift-away-subtle", duration: [160, 110], delay: [120, 0], placement: "top", offset: [10, 10], zIndex: 9999, children: _jsx("svg", { onMouseEnter: (e) => {
                                            // e.currentTarget.style.background = "#222";
                                            e.currentTarget.style.transform = "scale(1.1), rotate(90deg)";
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
                                        }, onClick: () => setSettingPage(prev => !prev), className: 'Setting', style: { cursor: 'pointer', border: 'none', outline: 'none' }, width: "20", height: "20", viewBox: "0 0 18 18", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M10.488 1.9065C10.5533 2.03325 10.5697 2.196 10.602 2.5215C10.6635 3.1365 10.6943 3.444 10.8232 3.6135C10.9036 3.71874 11.0104 3.80083 11.1328 3.85141C11.2552 3.902 11.3888 3.91928 11.52 3.9015C11.73 3.87375 11.97 3.678 12.4485 3.2865C12.7013 3.07875 12.828 2.97525 12.9637 2.93175C13.1366 2.8765 13.3237 2.88583 13.4902 2.958C13.6215 3.015 13.7378 3.1305 13.968 3.3615L14.6385 4.032C14.8695 4.263 14.985 4.3785 15.042 4.50975C15.1142 4.67629 15.1235 4.86336 15.0682 5.03625C15.0247 5.172 14.9212 5.29875 14.7142 5.5515C14.322 6.03075 14.1263 6.27 14.0978 6.48075C14.0802 6.61192 14.0977 6.74541 14.1484 6.86765C14.1991 6.98989 14.2812 7.09653 14.3865 7.17675C14.5552 7.30575 14.8635 7.3365 15.4792 7.398C15.804 7.43025 15.9668 7.44675 16.0942 7.512C16.2551 7.5954 16.3803 7.7342 16.4468 7.90275C16.5 8.0355 16.5 8.199 16.5 8.526V9.474C16.5 9.801 16.5 9.9645 16.4475 10.0965C16.3808 10.2656 16.255 10.4047 16.0935 10.488C15.9668 10.5533 15.804 10.5697 15.4785 10.602C14.8635 10.6635 14.556 10.6943 14.3865 10.8232C14.2813 10.9036 14.1992 11.0104 14.1486 11.1328C14.098 11.2552 14.0807 11.3888 14.0985 11.52C14.127 11.73 14.3227 11.97 14.7142 12.4485C14.9212 12.7013 15.0247 12.8272 15.0682 12.9637C15.1235 13.1366 15.1142 13.3237 15.042 13.4902C14.985 13.6215 14.8695 13.737 14.6385 13.968L13.968 14.6378C13.737 14.8695 13.6215 14.985 13.4902 15.0413C13.3237 15.1134 13.1366 15.1227 12.9637 15.0675C12.828 15.024 12.7013 14.9205 12.4485 14.7135C11.9692 14.322 11.73 14.1263 11.52 14.0985C11.3888 14.0807 11.2552 14.098 11.1328 14.1486C11.0104 14.1992 10.9036 14.2813 10.8232 14.3865C10.6943 14.5552 10.6635 14.8628 10.602 15.4785C10.5697 15.804 10.5533 15.9668 10.488 16.0935C10.4049 16.2549 10.2661 16.3807 10.0972 16.4475C9.9645 16.5 9.801 16.5 9.474 16.5H8.526C8.199 16.5 8.0355 16.5 7.9035 16.4475C7.73442 16.3808 7.5953 16.255 7.512 16.0935C7.44675 15.9668 7.43025 15.804 7.398 15.4785C7.3365 14.8635 7.30575 14.556 7.17675 14.3865C7.09644 14.2814 6.98976 14.1994 6.86753 14.1488C6.74529 14.0982 6.61185 14.0809 6.48075 14.0985C6.27 14.1263 6.03075 14.322 5.5515 14.7135C5.29875 14.9213 5.172 15.0247 5.03625 15.0682C4.86336 15.1235 4.67629 15.1142 4.50975 15.042C4.3785 14.985 4.26225 14.8695 4.032 14.6385L3.3615 13.968C3.1305 13.737 3.015 13.6215 2.958 13.4902C2.88583 13.3237 2.8765 13.1366 2.93175 12.9637C2.97525 12.828 3.07875 12.7013 3.28575 12.4485C3.678 11.9692 3.87375 11.73 3.9015 11.5192C3.91914 11.3881 3.90179 11.2547 3.85121 11.1325C3.80063 11.0102 3.71862 10.9036 3.6135 10.8232C3.44475 10.6943 3.1365 10.6635 2.52075 10.602C2.196 10.5697 2.03325 10.5533 1.90575 10.488C1.74491 10.4046 1.6197 10.2658 1.55325 10.0972C1.5 9.9645 1.5 9.801 1.5 9.474V8.526C1.5 8.199 1.5 8.0355 1.5525 7.9035C1.61917 7.73442 1.74496 7.5953 1.9065 7.512C2.03325 7.44675 2.196 7.43025 2.5215 7.398C3.1365 7.3365 3.44475 7.30575 3.6135 7.17675C3.71876 7.09653 3.80091 6.98989 3.85163 6.86765C3.90234 6.74541 3.91981 6.61192 3.90225 6.48075C3.87375 6.27 3.67725 6.03075 3.28575 5.55075C3.07875 5.298 2.97525 5.172 2.93175 5.0355C2.8765 4.86261 2.88583 4.67554 2.958 4.509C3.015 4.3785 3.1305 4.26225 3.3615 4.03125L4.032 3.3615C4.263 3.1305 4.3785 3.01425 4.50975 2.958C4.67629 2.88583 4.86336 2.8765 5.03625 2.93175C5.172 2.97525 5.29875 3.07875 5.5515 3.28575C6.03075 3.67725 6.27 3.873 6.48 3.9015C6.61141 3.91933 6.7452 3.902 6.86773 3.85128C6.99026 3.80055 7.09715 3.71825 7.1775 3.61275C7.305 3.444 7.3365 3.1365 7.398 2.52075C7.43025 2.196 7.44675 2.03325 7.512 1.90575C7.59526 1.74463 7.73407 1.61913 7.90275 1.5525C8.0355 1.5 8.199 1.5 8.526 1.5H9.474C9.801 1.5 9.9645 1.5 10.0965 1.5525C10.2656 1.61917 10.4047 1.74496 10.488 1.9065ZM9 12C9.79565 12 10.5587 11.6839 11.1213 11.1213C11.6839 10.5587 12 9.79565 12 9C12 8.20435 11.6839 7.44129 11.1213 6.87868C10.5587 6.31607 9.79565 6 9 6C8.20435 6 7.44129 6.31607 6.87868 6.87868C6.31607 7.44129 6 8.20435 6 9C6 9.79565 6.31607 10.5587 6.87868 11.1213C7.44129 11.6839 8.20435 12 9 12Z", fill: "#383838" }) }) }), _jsx(Tippy, { content: _jsx("span", { style: {
                                            color: "#EAEAEA",
                                            fontSize: "16px",
                                            fontWeight: 500,
                                            letterSpacing: "0.2px",
                                            background: "#1E1E1E",
                                            padding: "7px 11px",
                                            borderRadius: "10px",
                                            border: "1px solid rgba(255,255,255,0.06)",
                                            boxShadow: "0 8px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.03)",
                                        }, children: "Close" }), animation: "shift-away-subtle", duration: [160, 110], delay: [120, 0], placement: "top", offset: [10, 10], zIndex: 9999, children: _jsx("div", { onMouseEnter: (e) => {
                                            // e.currentTarget.style.background = "#222";
                                            setIsHovered2(true);
                                            e.currentTarget.style.transform = "scale(1.06)";
                                            e.currentTarget.style.boxShadow =
                                                "0 8px 20px rgba(0,0,0,.25)";
                                        }, onMouseLeave: (e) => {
                                            // e.currentTarget.style.background = "#1a1a1a";
                                            setIsHovered2(false);
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
                                        }, className: 'buttons', onClick: Close, style: { backgroundColor: isHovered2 ? 'red' : '#383838', borderRadius: '50%', cursor: 'pointer', transition: '0.4s ease-in-out', height: '20px', width: '20px' } }) })] }) })] }));
};
export default Header;
