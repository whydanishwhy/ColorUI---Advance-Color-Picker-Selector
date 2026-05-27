import { jsx as _jsx } from "react/jsx-runtime";
import { baseColor } from "./Constant";
const Switch = ({ checked = false, onChange, color = baseColor, }) => {
    const toggle = () => {
        onChange === null || onChange === void 0 ? void 0 : onChange(!checked);
    };
    return (_jsx("div", { onClick: toggle, style: {
            width: "25px",
            height: "16px",
            backgroundColor: checked ? color : "#5d5d5d",
            borderRadius: "50px",
            padding: "3px",
            cursor: "pointer",
            transition: "background-color 0.3s ease",
            display: "flex",
            alignItems: "center",
        }, children: _jsx("div", { style: {
                width: "15px",
                height: "15px",
                backgroundColor: "#121212",
                borderRadius: "50%",
                transform: checked
                    ? "translateX(9px)"
                    : "translateX(0)",
                transition: "transform 0.3s ease",
            } }) }));
};
export default Switch;
