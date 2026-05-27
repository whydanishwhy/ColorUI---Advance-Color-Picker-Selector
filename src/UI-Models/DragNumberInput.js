import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect, useCallback } from "react";
import "./style.css";
import { baseColor } from "./Constant";
const DragNumberInput = ({ onChange, step = 1, element, property, min, max, symbol, setIsDragging, isDraggingRef, label, }) => {
    const [value, setValue] = useState(0);
    const [isFocused, setIsFocused] = useState(false);
    const [isLocalDragging, setIsLocalDragging] = useState(false);
    const startX = useRef(0);
    const startValue = useRef(0);
    const inputRef = useRef(null);
    const rafRef = useRef(null);
    const unitlessProperties = ["fontWeight", "zIndex", "opacity"];
    const percentageProperties = ["opacity"];
    // ----------------------------
    // Sync with element style
    // ----------------------------
    useEffect(() => {
        if (!element)
            return;
        const computed = getComputedStyle(element);
        let numericValue = parseFloat(computed[property]);
        if (percentageProperties.includes(property)) {
            numericValue = Math.round(numericValue * 100);
        }
        if (!isNaN(numericValue)) {
            setValue(Math.round(numericValue));
        }
    }, [element, property]);
    // ----------------------------
    // Apply value
    // ----------------------------
    const applyValue = useCallback((val) => {
        let newVal = val;
        if (min !== undefined)
            newVal = Math.max(min, newVal);
        if (max !== undefined)
            newVal = Math.min(max, newVal);
        newVal = Math.round(newVal);
        if (element) {
            if (unitlessProperties.includes(property)) {
                element.style[property] = String(newVal);
            }
            else if (percentageProperties.includes(property)) {
                element.style[property] = String(newVal / 100);
            }
            else {
                element.style[property] = `${newVal}px`;
            }
        }
        setValue(newVal);
        onChange === null || onChange === void 0 ? void 0 : onChange(newVal);
    }, [element, property, min, max, onChange]);
    // ----------------------------
    // POINTER EVENTS (FIXED)
    // ----------------------------
    const handlePointerMove = useCallback((e) => {
        if (!isDraggingRef.current)
            return; // ✅ critical fix
        if (rafRef.current)
            cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
            const diff = e.clientX - startX.current;
            applyValue(startValue.current + diff * step);
        });
    }, [applyValue, step]);
    const stopDragging = useCallback(() => {
        if (rafRef.current)
            cancelAnimationFrame(rafRef.current);
        isDraggingRef.current = false;
        setIsDragging(false);
        setIsLocalDragging(false);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", stopDragging);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
    }, [handlePointerMove, setIsDragging, isDraggingRef]);
    const handlePointerDown = useCallback((e) => {
        e.preventDefault();
        isDraggingRef.current = true;
        setIsDragging(true);
        setIsLocalDragging(true);
        startX.current = e.clientX;
        startValue.current = value;
        document.body.style.userSelect = "none";
        document.body.style.cursor = "ew-resize";
        // ✅ capture pointer (THIS FIXES YOUR BUG)
        e.target.setPointerCapture(e.pointerId);
        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", stopDragging);
    }, [value, handlePointerMove, stopDragging, setIsDragging, isDraggingRef]);
    // ----------------------------
    // INPUT HANDLERS
    // ----------------------------
    const handleInputChange = (e) => {
        const num = Number(e.target.value);
        if (!isNaN(num))
            applyValue(num);
    };
    const handleFocus = () => {
        var _a;
        setIsFocused(true);
        (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.select();
    };
    const handleBlur = () => {
        setIsFocused(false);
    };
    // Cleanup
    useEffect(() => {
        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", stopDragging);
        };
    }, [handlePointerMove, stopDragging]);
    // ----------------------------
    // UI
    // ----------------------------
    return (_jsxs("div", { style: { width: 100 }, children: [label && _jsx("label", { style: { color: 'rgb(136 134 134)', marginBottom: '7px', fontSize: '13px' }, children: label }), _jsxs("div", { style: {
                    display: "flex",
                    alignItems: "center",
                    border: isFocused
                        ? `1px solid ${baseColor}`
                        : isLocalDragging
                            ? "1px solid #10b981"
                            : "1px solid #303030",
                    padding: 4,
                    borderRadius: 4,
                    // background: "#1e1e1e",
                    marginBottom: '10px'
                }, children: [_jsx("span", { onPointerDown: handlePointerDown, style: {
                            marginRight: 8,
                            cursor: "ew-resize",
                            color: isLocalDragging ? "#10b981" : `${baseColor}`,
                            userSelect: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }, children: symbol }), _jsx("input", { ref: inputRef, type: "number", value: value, onChange: handleInputChange, onFocus: handleFocus, onBlur: handleBlur, disabled: isLocalDragging, style: {
                            background: "transparent",
                            border: "none",
                            outline: "none",
                            color: "#d2d2d2",
                            fontWeight: '600',
                            fontSize: '16px',
                            width: 60,
                        } })] })] }));
};
export default DragNumberInput;
