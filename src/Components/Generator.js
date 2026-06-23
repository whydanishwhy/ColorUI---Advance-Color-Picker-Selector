import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
// Utility functions
function hexToRgb(hex) {
    if (hex[0] === "#")
        hex = hex.slice(1);
    return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
    };
}
function rgbToHex(r, g, b) {
    return `#${r.toString(16).padStart(2, "0")}${g
        .toString(16)
        .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toUpperCase();
}
function rgbToHsl(r, g, b) {
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
function hueToRgb(p, q, t) {
    if (t < 0)
        t += 1;
    if (t > 1)
        t -= 1;
    if (t < 1 / 6)
        return p + (q - p) * 6 * t;
    if (t < 1 / 2)
        return q;
    if (t < 2 / 3)
        return p + (q - p) * (2 / 3 - t) * 6;
    return p;
}
function hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    h /= 360;
    let r;
    let g;
    let b;
    if (s === 0) {
        r = g = b = l;
    }
    else {
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
function generateRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return rgbToHex(r, g, b);
}
function getComplementaryColor(hex) {
    const { r, g, b } = hexToRgb(hex);
    return [rgbToHex(255 - r, 255 - g, 255 - b)];
}
function getSplitComplementaryColor(hex) {
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
function getMonochromaticColors(hex) {
    const { r, g, b } = hexToRgb(hex);
    const shades = [];
    for (let i = 0; i < 5; i++) {
        const factor = 0.2 * (i - 2);
        const newR = Math.max(0, Math.min(255, r + factor * 255));
        const newG = Math.max(0, Math.min(255, g + factor * 255));
        const newB = Math.max(0, Math.min(255, b + factor * 255));
        shades.push(rgbToHex(Math.round(newR), Math.round(newG), Math.round(newB)));
    }
    return shades;
}
function ContrastCheck(hexColor) {
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
const PaletteOut = [1, 2, 3, 4, 5];
const Generator = ({ setColorPalette, colorPalette, }) => {
    const [lockedColors, setLockedColors] = useState([]);
    const [colorScheme, setColorScheme] = useState("default");
    const [showAddIcon, setShowAddIcon] = useState(0);
    const [screenNumber, setScreenNumber] = useState(0);
    const [filters, setFilters] = useState(0);
    const colorPaletteAnimate = useRef(null);
    const handleColorChange = (index, newColor) => {
        const updatedPalette = [...colorPalette];
        updatedPalette[index] = newColor;
        setColorPalette(updatedPalette);
    };
    const gen = () => {
        const primaryColor = generateRandomColor();
        let tempColor = primaryColor;
        const palette = [];
        const usedColors = new Set();
        PaletteOut.forEach((_, i) => {
            const lockedColor = lockedColors.find((lock) => lock.index === i);
            if (lockedColor) {
                palette[i] = lockedColor.color;
                usedColors.add(lockedColor.color);
            }
            else {
                palette[i] = null;
            }
        });
        PaletteOut.forEach((_, i) => {
            if (palette[i] !== null)
                return;
            let colors = [];
            if (colorScheme === "default") {
                colors = [
                    ...getComplementaryColor(tempColor),
                    ...getSplitComplementaryColor(tempColor),
                    ...getMonochromaticColors(tempColor),
                ];
            }
            else if (colorScheme === "monochromatic") {
                colors = getMonochromaticColors(tempColor);
            }
            else if (colorScheme === "complementary") {
                colors = getComplementaryColor(tempColor);
            }
            else if (colorScheme === "split-complementary") {
                colors = getSplitComplementaryColor(tempColor);
            }
            const availableColors = colors.filter((color) => !usedColors.has(color));
            if (availableColors.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableColors.length);
                const newColor = availableColors[randomIndex];
                palette[i] = newColor;
                usedColors.add(newColor);
                tempColor = newColor;
            }
            else {
                const newColor = generateRandomColor();
                palette[i] = newColor;
                usedColors.add(newColor);
                tempColor = newColor;
                console.log("Fallback random color generated");
            }
        });
        setColorPalette(palette.filter(Boolean));
    };
    const lockBtn = (index, color) => {
        setLockedColors((prevLockedColors) => {
            const isAlreadyLocked = prevLockedColors.some((lock) => lock.index === index);
            if (isAlreadyLocked) {
                return prevLockedColors.filter((lock) => lock.index !== index);
            }
            return [...prevLockedColors, { index, color }];
        });
    };
    const addMoreColors = () => {
        setShowAddIcon(1);
    };
    const mouseout = () => {
        setShowAddIcon(0);
    };
    useEffect(() => {
        gen();
    }, []);
    const changeScreen = () => {
        setScreenNumber((prev) => (prev ? 0 : 1));
    };
    const showFilters = () => {
        setFilters((prev) => (prev ? 0 : 1));
    };
    return (_jsx(_Fragment, { children: _jsxs("div", { style: {
                width: '100%',
                boxSizing: 'border-box',
                height: '200px'
            }, children: [_jsx("div", { ref: colorPaletteAnimate, style: {
                        display: "flex",
                        border: "1px solid #242424",
                        width: "100%",
                        height: "100%",
                        boxSizing: "border-box",
                    }, children: colorPalette.map((color, index) => (_jsx("div", { className: "ello", style: {
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
                        }, onMouseEnter: addMoreColors, onMouseLeave: mouseout, children: _jsxs("div", { style: {
                                display: "flex",
                                flexDirection: "column",
                                gap: "20px",
                            }, children: [_jsxs("span", { style: { cursor: "pointer" }, onClick: () => lockBtn(index, color), children: [color, lockedColors.some((lock) => lock.index === index)
                                            ? " 🔒"
                                            : ""] }), _jsx("input", { type: "color", value: color, onChange: (e) => handleColorChange(index, e.target.value), style: {
                                        cursor: "pointer",
                                        width: "10px",
                                        height: "10px",
                                        border: "none",
                                        padding: 0,
                                    } })] }) }, index))) }), _jsx("button", { style: {
                        cursor: "pointer",
                        background: "#242424",
                        color: "white",
                        marginTop: "10px",
                    }, onClick: gen, children: "Generate Palette" })] }) }));
};
export default Generator;
