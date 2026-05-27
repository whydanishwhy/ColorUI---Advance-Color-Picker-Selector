import React, { useEffect, useState, ChangeEvent } from "react";

type ColorFilter =
  | "normal"
  | "protanopia"
  | "protanomaly"
  | "deuteranopia"
  | "tritanomaly";

const ColorBlindness: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<ColorFilter>("normal");

  useEffect(() => {
    const colorBlindnessFilters = document.createElement("div");

    colorBlindnessFilters.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
        <filter id="protanomaly">
          <feColorMatrix type="matrix" values="
            0.817 0.183 0   0  0
            0.333 0.667 0   0  0
            0     0.125 0.875 0  0
            0     0     0     1  0
          " />
        </filter>

        <filter id="protanopia">
          <feColorMatrix type="matrix" values="
            0.567 0.433 0     0 0
            0.558 0.442 0     0 0
            0     0.242 0.758 0 0
            0     0     0     1 0
          " />
        </filter>

        <filter id="deuteranomaly">
          <feColorMatrix type="matrix" values="
            0.8   0.2   0   0  0
            0.258 0.742 0   0  0
            0     0.142 0.858 0  0
            0     0     0     1  0
          " />
        </filter>

        <filter id="tritanomaly">
          <feColorMatrix type="matrix" values="
            0.967 0.033 0   0  0
            0     0.733 0.267 0  0
            0     0.183 0.817 0  0
            0     0     0     1  0
          " />
        </filter>
      </svg>
    `;

    const rootElement = document.getElementById("custom-filter-layer");

    if (!rootElement) return;

    // Avoid duplicating SVG filters
    if (!rootElement.querySelector("svg")) {
      rootElement.appendChild(colorBlindnessFilters);
    }

    rootElement.style.backdropFilter =
      selectedFilter === "normal"
        ? ""
        : `url(#${selectedFilter})`;
  }, [selectedFilter]);

  const VisionBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const blur = e.target.value;

    const drawnDiv = document.getElementById("custom-drawn-div");
    const filterLayer = document.getElementById("custom-filter-layer");

    if (drawnDiv) {
      drawnDiv.style.backdropFilter = `blur(${blur}px)`;
    } else if (filterLayer) {
      filterLayer.style.backdropFilter = `blur(${blur}px)`;
    }
  };

  return (
    <>
      <div style={{ padding: "10px", marginBottom: "10px" }}>
        <span style={{ color: "grey" }}>Color Blindness</span>

        <div style={{ marginTop: "10px" }}>
          {[
            ["normal", "Normal"],
            ["protanopia", "Protanopia"],
            ["deuteranopia", "Deuteranopia"],
            ["tritanomaly", "Tritanomaly"],
            ["protanomaly", "Protanomaly"],
          ].map(([value, label]) => (
            <div
              key={value}
              style={{ display: "flex", alignItems: "center" }}
            >
              <span style={{ width: "50%" }}>{label}</span>
              <input
                style={{ width: "50%", cursor: "pointer" }}
                type="radio"
                name="colorBlindness"
                value={value}
                checked={selectedFilter === value}
                onChange={() => setSelectedFilter(value as ColorFilter)}
              />
            </div>
          ))}
        </div>

        <span
          style={{
            color: "grey",
            marginTop: "10px",
            display: "block",
          }}
        >
          Blur Vision
        </span>

        <input
          min={0}
          max={50}
          step={1}
          type="range"
          onChange={VisionBlur}
        />
      </div>
    </>
  );
};

export default ColorBlindness;
