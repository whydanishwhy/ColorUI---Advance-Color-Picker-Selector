import React, { useState, useRef, useEffect, useCallback } from "react";
import "./style.css";
import { baseColor } from "./Constant";
interface DragNumberInputProps {
  onChange?: (val: number) => void;
  step?: number;
  element: HTMLElement | null;
  property:
    | "width"
    | "height"
    | "margin"
    | "padding"
    | "paddingTop"
    | "paddingBottom"
    | "paddingLeft"
    | "paddingRight"
    | "marginTop"
    | "marginBottom"
    | "marginLeft"
    | "marginRight"
    | "fontSize"
    | "fontWeight"
    | "letterSpacing"
    | "lineHeight"
    | "wordSpacing"
    | "borderRadius"
    | "borderWidth"
    | "opacity"
    | "zIndex"
    | "boxShadow";
  min?: number;
  max?: number;
  symbol: string | React.ReactElement;
  isDragging: boolean;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
  isDraggingRef: React.MutableRefObject<boolean>;
  label?: string;
}

const DragNumberInput: React.FC<DragNumberInputProps> = ({
  onChange,
  step = 1,
  element,
  property,
  min,
  max,
  symbol,
  setIsDragging,
  isDraggingRef,
  label,
}) => {
  const [value, setValue] = useState<number>(0);
  const [isFocused, setIsFocused] = useState(false);
  const [isLocalDragging, setIsLocalDragging] = useState(false);

  const startX = useRef(0);
  const startValue = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const rafRef = useRef<number | null>(null);

  const unitlessProperties = ["fontWeight", "zIndex", "opacity"];
  const percentageProperties = ["opacity"];

  // ----------------------------
  // Sync with element style
  // ----------------------------
  useEffect(() => {
    if (!element) return;

    const computed = getComputedStyle(element);
    let numericValue = parseFloat(computed[property as any]);

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
  const applyValue = useCallback(
    (val: number) => {
      let newVal = val;

      if (min !== undefined) newVal = Math.max(min, newVal);
      if (max !== undefined) newVal = Math.min(max, newVal);

      newVal = Math.round(newVal);

      if (element) {
        if (unitlessProperties.includes(property)) {
          element.style[property as any] = String(newVal);
        } else if (percentageProperties.includes(property)) {
          element.style[property as any] = String(newVal / 100);
        } else {
          element.style[property as any] = `${newVal}px`;
        }
      }

      setValue(newVal);
      onChange?.(newVal);
    },
    [element, property, min, max, onChange]
  );

  // ----------------------------
  // POINTER EVENTS (FIXED)
  // ----------------------------
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDraggingRef.current) return; // ✅ critical fix

      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const diff = e.clientX - startX.current;
        applyValue(startValue.current + diff * step);
      });
    },
    [applyValue, step]
  );

  const stopDragging = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    isDraggingRef.current = false;
    setIsDragging(false);
    setIsLocalDragging(false);

    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", stopDragging);

    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  }, [handlePointerMove, setIsDragging, isDraggingRef]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();

      isDraggingRef.current = true;
      setIsDragging(true);
      setIsLocalDragging(true);

      startX.current = e.clientX;
      startValue.current = value;

      document.body.style.userSelect = "none";
      document.body.style.cursor = "ew-resize";

      // ✅ capture pointer (THIS FIXES YOUR BUG)
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", stopDragging);
    },
    [value, handlePointerMove, stopDragging, setIsDragging, isDraggingRef]
  );

  // ----------------------------
  // INPUT HANDLERS
  // ----------------------------
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    if (!isNaN(num)) applyValue(num);
  };

  const handleFocus = () => {
    setIsFocused(true);
    inputRef.current?.select();
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
  return (
    <div style={{ width: 100 }}>
      {label && <label style={{color:'rgb(136 134 134)', marginBottom:'7px', fontSize:'13px'}}>{label}</label>}

      <div
        style={{
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
          marginBottom:'10px'
        }}

      >
        {/* DRAG HANDLE */}
        <span
          onPointerDown={handlePointerDown}
          style={{
            marginRight: 8,
            cursor: "ew-resize",
            color: isLocalDragging ? "#10b981" : `${baseColor}`,
            userSelect: "none",
            display: "flex",          
            alignItems: "center",     
            justifyContent: "center",
          }}
        >
          {symbol}
        </span>

        {/* INPUT */}
        <input
          ref={inputRef}
          type="number"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={isLocalDragging}
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#d2d2d2",
            fontWeight:'600',
            fontSize:'16px',
            width: 60,

          }}
        />

        {/* UNIT */}
        {/* {!unitlessProperties.includes(property) && (
          <span style={{ color: "#666", fontSize: 11 }}>
            {percentageProperties.includes(property) ? "%" : "px"}
          </span>
        )} */}
      </div>
    </div>
  );
};

export default DragNumberInput;