import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
const FigmaInputSlider = ({ element, property, min = 0, max = 1000, step = 1, }) => {
    // State for real value
    const [value, setValue] = useState(0);
    // Sync with element on mount or change
    useEffect(() => {
        if (element) {
            const computedValue = parseInt(getComputedStyle(element)[property], 10);
            setValue(computedValue);
        }
    }, [element, property]);
    // Handle slider change
    const handleSliderChange = (val) => {
        if (element) {
            element.style[property] = `${val}px`;
        }
        setValue(val);
    };
    // Handle number input change
    const handleInputChange = (e) => {
        const val = Number(e.target.value);
        if (element) {
            element.style[property] = `${val}px`;
        }
        setValue(val);
    };
    // Slider value capped at max
    const sliderValue = value > max ? max : value;
    return (_jsxs("div", { style: { display: "flex", alignItems: "center", gap: "10px" }, children: [_jsx("input", { type: "number", value: value, onChange: handleInputChange, style: { width: "80px", padding: "5px" } }), _jsx("input", { type: "range", min: min, max: max, step: step, value: sliderValue, onChange: (e) => handleSliderChange(Number(e.target.value)), style: { flex: 1 } })] }));
};
export default FigmaInputSlider;
