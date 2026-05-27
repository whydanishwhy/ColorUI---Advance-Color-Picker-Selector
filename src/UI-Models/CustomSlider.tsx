import React, { useState, CSSProperties, MouseEvent, useRef } from "react";

interface CustomSliderProps {
  min?: number;
  max?: number;
  step?: number;
  initialValue?: number;
  onChange?: (value: number) => void;
  width?: number | string;
  trackColor?: string;
  fillColor?: string;
  thumbColor?: string;
  element?:HTMLElement | null;
}

const CustomSlider: React.FC<CustomSliderProps> = ({
  min = 0,
  max = 100,
  step = 10,
  initialValue = 0,
  onChange,
  width = 300,
  trackColor = "#ccc",
  fillColor = "#4f46e5",
  thumbColor = "#fff",
  element
}) => {
  const [value, setValue] = useState<number>(initialValue);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<boolean>(false);

  // Calculate value based on mouse position
  const updateValue = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    let percentage = (clientX - rect.left) / rect.width;
    percentage = Math.max(0, Math.min(1, percentage));
    const newValue = Math.round((min + percentage * (max - min)) / step) * step;
    setValue(newValue);
  
    if (onChange) onChange(newValue);
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setDragging(true);
    updateValue(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent<Document>) => {
    if (!dragging) return;
    updateValue(e.clientX);
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  React.useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove as any);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove as any);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  // Styles
  const containerStyle: CSSProperties = {
    width,
    padding: "10px 0",
    userSelect: "none",
  };

  const trackStyle: CSSProperties = {
    width: "100%",
    height: 6,
    backgroundColor: trackColor,
    borderRadius: 3,
    position: "relative",
  };

  const fillStyle: CSSProperties = {
    position: "absolute",
    height: "100%",
    left: 0,
    width: `${((value - min) / (max - min)) * 100}%`,
    backgroundColor: fillColor,
    borderRadius: 3,
  };

  const thumbStyle: CSSProperties = {
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

  return (
    <div style={containerStyle}>
      <div ref={sliderRef} style={trackStyle} onMouseDown={handleMouseDown}>
        <div style={fillStyle}></div>
        <div style={thumbStyle}></div>
      </div>
    </div>
  );
};

export default CustomSlider;
