import React, { useState, useEffect } from "react";

interface FigmaInputSliderProps {
  element: HTMLElement | null;
  property: "width" | "height" | "margin" | "padding" | "paddingTop" | "marginBottom"; // can extend later
  min?: number;
  max?: number;
  step?: number;
}

const FigmaInputSlider: React.FC<FigmaInputSliderProps> = ({
  element,
  property,
  min = 0,
  max = 1000,
  step = 1,
}) => {
  // State for real value
  const [value, setValue] = useState<number>(0);

  // Sync with element on mount or change
  useEffect(() => {
    if (element) {
      const computedValue = parseInt(
        getComputedStyle(element)[property],
        10
      );
      setValue(computedValue);
    }
  }, [element, property]);

  // Handle slider change
  const handleSliderChange = (val: number) => {
    if (element) {
      element.style[property as any] = `${val}px`;
    }
    setValue(val);
  };

  // Handle number input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (element) {
      element.style[property as any] = `${val}px`;
    }
    setValue(val);
  };

  // Slider value capped at max
  const sliderValue = value > max ? max : value;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      {/* Number Input */}
      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        style={{ width: "80px", padding: "5px" }}
      />

      {/* Slider */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={sliderValue}
        onChange={(e) => handleSliderChange(Number(e.target.value))}
        style={{ flex: 1 }}
      />
    </div>
  );
};

export default FigmaInputSlider;
