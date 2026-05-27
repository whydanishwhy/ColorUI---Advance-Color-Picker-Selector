import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { MousePointer2 } from "lucide-react";
import { baseColor } from "../UI-Models/Constant";
const InstructionSelectElement = () => {
    return (_jsxs(_Fragment, { children: [_jsx("style", { children: `
          @keyframes pulseAnim {
            0% {
              transform: scale(1);
              opacity: 0.8;
            }
            70% {
              transform: scale(4);
              opacity: 0;
            }
            100% {
              opacity: 0;
            }
          }

          .pulse {
            position: absolute;
            inset: 0;
            border: 2px solid ${baseColor};
            border-radius: 50%;
            animation: pulseAnim 2s infinite;
            opacity: 0;
          }
        ` }), _jsxs("div", { style: {
                    height: "300px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "16px",
                }, children: [_jsxs("div", { style: {
                            position: "relative",
                            width: "20px",
                            height: "20px",
                        }, children: [_jsx("div", { style: {
                                    width: "20px",
                                    height: "20px",
                                    background: baseColor,
                                    borderRadius: "50%",
                                    zIndex: 2,
                                    position: "relative",
                                } }), _jsx(MousePointer2, { size: 24 }), _jsx("div", { className: "pulse", style: { animationDelay: "0s" } }), _jsx("div", { className: "pulse", style: { animationDelay: "0.5s" } }), _jsx("div", { className: "pulse", style: { animationDelay: "1s" } })] }), _jsx("p", { style: { fontSize: '18px', color: '#838383' }, children: "Select Element" })] })] }));
};
export default InstructionSelectElement;
