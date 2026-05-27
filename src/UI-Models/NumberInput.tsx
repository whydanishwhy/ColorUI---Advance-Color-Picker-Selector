import React, { useState, ChangeEvent, CSSProperties } from "react";

interface DarkNumberInputProps {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
}

const NumberInput: React.FC<DarkNumberInputProps> = ({
  value = 0,
  min = 0,
  max = 100,
  step = 1,
  onChange,
}) => {
  const [val, setVal] = useState<number>(value);
  const [hover, setHover] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newVal = Number(e.target.value);
    setVal(newVal);
    if (onChange) onChange(newVal);
  };

  const containerStyle: CSSProperties = {
    position: "relative",
    width: 80,
    fontFamily: "sans-serif",
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    padding: "6px 28px 6px 8px",
    borderRadius: 6,
    border: "1px solid #444",
    backgroundColor: "#111",
    color: "#fff",
    outline: "none",
    fontSize: 16,
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "textfield",
  };

  const arrowsStyle: CSSProperties = {
    display: hover ? "flex" : "none",
    flexDirection: "column",
    position: "absolute",
    right: 4,
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    userSelect: "none",
  };

  const arrowButtonStyle: CSSProperties = {
    width: 16,
    height: 16,
    lineHeight: "16px",
    textAlign: "center",
    fontSize: 12,
    border: "1px solid #444",
    borderRadius: 2,
    background: "#222",
    color: "#fff",
    marginBottom: 2,
  };

  const increment = () => {
    setVal((prev) => {
      const newVal = Math.min(prev + step, max);
      if (onChange) onChange(newVal);
      return newVal;
    });
  };

  const decrement = () => {
    setVal((prev) => {
      const newVal = Math.max(prev - step, min);
      if (onChange) onChange(newVal);
      return newVal;
    });
  };

  return (
    <div
      style={containerStyle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <input
        type="number"
        value={val}
        min={min}
        max={max}
        step={step}
        onChange={handleChange}
        style={inputStyle}
      />
      <div style={arrowsStyle}>
        <div style={arrowButtonStyle} onClick={increment}>
          ▲
        </div>
        <div style={arrowButtonStyle} onClick={decrement}>
          ▼
        </div>
      </div>
    </div>
  );
};

export default NumberInput;
