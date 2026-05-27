import React, { useState, useEffect } from "react";
import CustomSlider from "../UI-Models/CustomSlider";
import NumberInput from "../UI-Models/NumberInput";

interface ChildProps {
  element: HTMLElement | null;
}

const Width: React.FC<ChildProps> = ({ element }) => {
  // State to store actual width of element
  const [width, setWidth] = useState<number>(0);

  // Compute width from element when element changes
  useEffect(() => {
    if (element) {
      const computedWidth = parseInt(getComputedStyle(element).width, 10);
      setWidth(computedWidth);
    }
  }, [element]);

  // Handle slider change
  const handleSliderChange = (val: number) => {
    if (element) {
      element.style.width = `${val}px`;
    }
    setWidth(val);
  };

  // Handle number input change
  const handleNumberInputChange = (val: number) => {
    if (element) {
      element.style.width = `${val}px`;
    }
    setWidth(val);
  };

  // Determine what slider should display
  const sliderValue = width > 1000 ? 1000 : width;

  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
      <span>Width:</span>

      {/* Slider */}
      <CustomSlider
        min={0}
        max={1000}
        step={10}
        initialValue={sliderValue}
        element={element}
        onChange={handleSliderChange}
      />

      {/* Number Input */}
      <NumberInput value={width} onChange={handleNumberInputChange} />
    </div>
  );
};

export default Width;
