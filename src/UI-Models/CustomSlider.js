import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useRef } from "react";
const CustomSlider = ({ min = 0, max = 100, step = 10, initialValue = 0, onChange, width = 300, trackColor = "#ccc", fillColor = "#4f46e5", thumbColor = "#fff", element }) => {
    const [value, setValue] = useState(initialValue);
    const sliderRef = useRef(null);
    const [dragging, setDragging] = useState(false);
    // Calculate value based on mouse position
    const updateValue = (clientX) => {
        if (!sliderRef.current)
            return;
        const rect = sliderRef.current.getBoundingClientRect();
        let percentage = (clientX - rect.left) / rect.width;
        percentage = Math.max(0, Math.min(1, percentage));
        const newValue = Math.round((min + percentage * (max - min)) / step) * step;
        setValue(newValue);
        if (onChange)
            onChange(newValue);
    };
    const handleMouseDown = (e) => {
        setDragging(true);
        updateValue(e.clientX);
    };
    const handleMouseMove = (e) => {
        if (!dragging)
            return;
        updateValue(e.clientX);
    };
    const handleMouseUp = () => {
        setDragging(false);
    };
    React.useEffect(() => {
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [dragging]);
    // Styles
    const containerStyle = {
        width,
        padding: "10px 0",
        userSelect: "none",
    };
    const trackStyle = {
        width: "100%",
        height: 6,
        backgroundColor: trackColor,
        borderRadius: 3,
        position: "relative",
    };
    const fillStyle = {
        position: "absolute",
        height: "100%",
        left: 0,
        width: `${((value - min) / (max - min)) * 100}%`,
        backgroundColor: fillColor,
        borderRadius: 3,
    };
    const thumbStyle = {
        position: "absolute",
        top: "50%",
        left: `${((value - min) / (max - min)) * 100}%`,
        transform: "translate(-50%, -50%)",
        width: 16,
        height: 16,
        borderRadius: "50%",
        backgroundColor: thumbColor,
        border: "2px solid #4f46e5",
        cursor: "pointer",
    };
    return (_jsx("div", { style: containerStyle, children: _jsxs("div", { ref: sliderRef, style: trackStyle, onMouseDown: handleMouseDown, children: [_jsx("div", { style: fillStyle }), _jsx("div", { style: thumbStyle })] }) }));
};
export default CustomSlider;
