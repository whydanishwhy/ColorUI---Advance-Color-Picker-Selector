import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import CustomSlider from "../UI-Models/CustomSlider";
import NumberInput from "../UI-Models/NumberInput";
const Width = ({ element }) => {
    // State to store actual width of element
    const [width, setWidth] = useState(0);
    // Compute width from element when element changes
    useEffect(() => {
        if (element) {
            const computedWidth = parseInt(getComputedStyle(element).width, 10);
            setWidth(computedWidth);
        }
    }, [element]);
    // Handle slider change
    const handleSliderChange = (val) => {
        if (element) {
            element.style.width = `${val}px`;
        }
        setWidth(val);
    };
    // Handle number input change
    const handleNumberInputChange = (val) => {
        if (element) {
            element.style.width = `${val}px`;
        }
        setWidth(val);
    };
    // Determine what slider should display
    const sliderValue = width > 1000 ? 1000 : width;
    return (_jsxs("div", { style: { display: "flex", gap: "10px", alignItems: "center" }, children: [_jsx("span", { children: "Width:" }), _jsx(CustomSlider, { min: 0, max: 1000, step: 10, initialValue: sliderValue, element: element, onChange: handleSliderChange }), _jsx(NumberInput, { value: width, onChange: handleNumberInputChange })] }));
};
export default Width;
