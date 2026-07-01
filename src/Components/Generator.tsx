import React, { useState, useEffect, useRef } from "react";
import Visualizer from "./Visualizer";

type RGB = {
  r: number;
  g: number;
  b: number;
};

type HSL = {
  h: number;
  s: number;
  l: number;
};

type LockedColor = {
  index: number;
  color: string;
};

type ColorScheme =
  | "default"
  | "monochromatic"
  | "complementary"
  | "split-complementary";

type GeneratorProps = {
  colorPalette: string[] ;
  setColorPalette: React.Dispatch<React.SetStateAction<string[]>>;
};

// Utility functions
function hexToRgb(hex: string): RGB {
  if (hex[0] === "#") hex = hex.slice(1);

  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toUpperCase();
}

function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;

    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;

      case g:
        h = (b - r) / d + 2;
        break;

      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return {
    h: h * 360,
    s: s * 100,
    l: l * 100,
  };
}

function hueToRgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;

  return p;
}

function hslToRgb(h: number, s: number, l: number): RGB {
  s /= 100;
  l /= 100;
  h /= 360;

  let r: number;
  let g: number;
  let b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hueToRgb(p, q, h + 1 / 3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// Color harmony functions
function generateRandomColor(): string {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);

  return rgbToHex(r, g, b);
}

function getComplementaryColor(hex: string): string[] {
  const { r, g, b } = hexToRgb(hex);

  return [rgbToHex(255 - r, 255 - g, 255 - b)];
}

function getSplitComplementaryColor(hex: string): string[] {
  const complementHex = getComplementaryColor(hex)[0];
  const { r: compR, g: compG, b: compB } = hexToRgb(complementHex);

  const offset = 60;

  const split1 = {
    r: Math.max(0, Math.min(255, compR + offset)),
    g: Math.max(0, Math.min(255, compG - offset)),
    b: Math.max(0, Math.min(255, compB - offset)),
  };

  const split2 = {
    r: Math.max(0, Math.min(255, compR - offset)),
    g: Math.max(0, Math.min(255, compG + offset)),
    b: Math.max(0, Math.min(255, compB + offset)),
  };

  return [
    rgbToHex(split1.r, split1.g, split1.b),
    rgbToHex(split2.r, split2.g, split2.b),
  ];
}

function getMonochromaticColors(hex: string): string[] {
  const { r, g, b } = hexToRgb(hex);

  const shades: string[] = [];

  for (let i = 0; i < 5; i++) {
    const factor = 0.2 * (i - 2);

    const newR = Math.max(0, Math.min(255, r + factor * 255));
    const newG = Math.max(0, Math.min(255, g + factor * 255));
    const newB = Math.max(0, Math.min(255, b + factor * 255));

    shades.push(
      rgbToHex(
        Math.round(newR),
        Math.round(newG),
        Math.round(newB)
      )
    );
  }

  return shades;
}

function ContrastCheck(hexColor: string): "black" | "white" {
  hexColor = hexColor.replace("#", "");

  let r = parseInt(hexColor.substring(0, 2), 16);
  let g = parseInt(hexColor.substring(2, 4), 16);
  let b = parseInt(hexColor.substring(4, 6), 16);

  r /= 255;
  g /= 255;
  b /= 255;

  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  return luminance > 0.5 ? "black" : "white";
}

const PaletteOut: number[] = [1, 2, 3, 4, 5];

const Generator: React.FC<GeneratorProps> = ({
  setColorPalette,
  colorPalette,
}) => {
  const [lockedColors, setLockedColors] = useState<LockedColor[]>([]);
  const [colorScheme, setColorScheme] =
    useState<ColorScheme>("default");

  const [showAddIcon, setShowAddIcon] = useState<number>(0);
  const [screenNumber, setScreenNumber] = useState<number>(0);
  const [filters, setFilters] = useState<number>(0);

  const colorPaletteAnimate = useRef<HTMLDivElement | null>(null);

  const handleColorChange = (
    index: number,
    newColor: string
  ): void => {
    const updatedPalette = [...colorPalette];
    updatedPalette[index] = newColor;
    setColorPalette(updatedPalette);
  };

  const gen = (): void => {
    const primaryColor = generateRandomColor();
    let tempColor = primaryColor;

    const palette: (string | null)[] = [];
    const usedColors = new Set<string>();

    PaletteOut.forEach((_, i) => {
      const lockedColor = lockedColors.find(
        (lock) => lock.index === i
      );

      if (lockedColor) {
        palette[i] = lockedColor.color;
        usedColors.add(lockedColor.color);
      } else {
        palette[i] = null;
      }
    });

    PaletteOut.forEach((_, i) => {
      if (palette[i] !== null) return;

      let colors: string[] = [];

      if (colorScheme === "default") {
        colors = [
          ...getComplementaryColor(tempColor),
          ...getSplitComplementaryColor(tempColor),
          ...getMonochromaticColors(tempColor),
        ];
      } else if (colorScheme === "monochromatic") {
        colors = getMonochromaticColors(tempColor);
      } else if (colorScheme === "complementary") {
        colors = getComplementaryColor(tempColor);
      } else if (colorScheme === "split-complementary") {
        colors = getSplitComplementaryColor(tempColor);
      }

      const availableColors = colors.filter(
        (color) => !usedColors.has(color)
      );

      if (availableColors.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * availableColors.length
        );

        const newColor = availableColors[randomIndex];

        palette[i] = newColor;
        usedColors.add(newColor);
        tempColor = newColor;
      } else {
        const newColor = generateRandomColor();

        palette[i] = newColor;
        usedColors.add(newColor);
        tempColor = newColor;

        console.log("Fallback random color generated");
      }
    });

    setColorPalette(palette.filter(Boolean) as string[]);
  };

  const lockBtn = (index: number, color: string): void => {
    setLockedColors((prevLockedColors) => {
      const isAlreadyLocked = prevLockedColors.some(
        (lock) => lock.index === index
      );

      if (isAlreadyLocked) {
        return prevLockedColors.filter(
          (lock) => lock.index !== index
        );
      }

      return [...prevLockedColors, { index, color }];
    });
  };

  const addMoreColors = (): void => {
    setShowAddIcon(1);
  };

  const mouseout = (): void => {
    setShowAddIcon(0);
  };

  useEffect(() => {
    gen();
  }, []);

  const changeScreen = (): void => {
    setScreenNumber((prev) => (prev ? 0 : 1));
  };

  const showFilters = (): void => {
    setFilters((prev) => (prev ? 0 : 1));
  };

  return (
    <>
      <div
        style={{
      
          width:'100%',
          boxSizing:'border-box',
          height:'200px'

        }}
      >
        {/* Optional Color Scheme Selector */}
        {/*
        <select
          onChange={(e) =>
            setColorScheme(e.target.value as ColorScheme)
          }
        >
          <option value="default">default</option>
          <option value="monochromatic">monochromatic</option>
          <option value="complementary">complementary</option>
          <option value="split-complementary">
            split-complementary
          </option>
        </select>
        */}

        {/* <Visualizer colorPalette={colorPalette} /> */}

        <div
          ref={colorPaletteAnimate}
          style={{
            display: "flex",
            border: "1px solid #242424",
            width: "100%",
            height: "100%",
            boxSizing: "border-box",
          }}
        >
          {colorPalette.map((color: string, index: number) => (
            <div
              key={index}
              className="ello"
              style={{
                height: "100%",
                width: "100%",
                backgroundColor: color,
                color: ContrastCheck(color),
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "11px",
                padding: "9px",
                boxSizing: "border-box",
                textAlign: "center",
              }}
              onMouseEnter={addMoreColors}
              onMouseLeave={mouseout}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => lockBtn(index, color)}
                >
                  {color}
                  {lockedColors.some(
                    (lock) => lock.index === index
                  )
                    ? " 🔒"
                    : ""}
                </span>

                <input
                  type="color"
                  value={color}
                  onChange={(
                    e: React.ChangeEvent<HTMLInputElement>
                  ) =>
                    handleColorChange(index, e.target.value)
                  }
                  style={{
                    cursor: "pointer",
                    width: "10px",
                    height: "10px",
                    border: "none",
                    padding: 0,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          style={{
            cursor: "pointer",
            background: "#242424",
            color: "white",
            marginTop: "10px",
            zIndex:888,
            position:'fixed',
            top:'20px'
          }}
          onClick={gen}
        >
          Generate Palette
        </button>
      </div>
    </>
  );
};

export default Generator;