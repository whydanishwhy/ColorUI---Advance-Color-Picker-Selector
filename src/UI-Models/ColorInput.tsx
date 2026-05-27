import React, { useState, useEffect, useRef } from "react";

interface ColorInputProps {
  element: HTMLElement | null;
  mode:
    | "color"
    | "backgroundColor"
    | "background"
    | "textGradient"
    | "borderColor"
    | "shadowColor";
  Bgcolor: string;
}

// Unique attribute to identify our overlay layer
const OVERLAY_ATTR = "data-color-input-overlay";
// Attribute to store original position so we can restore it
const ORIGINAL_POSITION_ATTR = "data-color-input-orig-position";

/**
 * Creates or retrieves an overlay layer inside the given element.
 * The overlay is pointer-events:none and sits behind children (z-index: 0),
 * while children get z-index: 1 relative to the parent so they stay on top.
 */
function getOrCreateOverlay(element: HTMLElement): HTMLDivElement {
  // Check if overlay already exists
  const existing = element.querySelector(
    `[${OVERLAY_ATTR}]`
  ) as HTMLDivElement | null;
  if (existing) return existing;

  // Ensure the element is positioned so absolute children work
  const currentPosition = getComputedStyle(element).position;
  if (currentPosition === "static") {
    element.setAttribute(ORIGINAL_POSITION_ATTR, "static");
    element.style.position = "relative";
  }

  const overlay = document.createElement("div");
  overlay.setAttribute(OVERLAY_ATTR, "true");
  overlay.style.cssText = `
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    border-radius: inherit;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  `;

  // Insert as first child so it sits behind all existing children
  element.insertBefore(overlay, element.firstChild);

  // Push direct children (except the overlay) to z-index: 1 so they're above overlay
  Array.from(element.children).forEach((child) => {
    if (child !== overlay) {
      const el = child as HTMLElement;
      // Only set if not already set to avoid overwriting intentional z-indices
      if (!el.style.zIndex || el.style.zIndex === "0") {
        el.style.zIndex = "1";
        el.setAttribute("data-color-input-z-patched", "true");
      }
    }
  });

  return overlay;
}

/**
 * Removes the overlay and cleans up changes made to the element and its children.
 */
function removeOverlay(element: HTMLElement): void {
  const overlay = element.querySelector(
    `[${OVERLAY_ATTR}]`
  ) as HTMLDivElement | null;
  if (overlay) overlay.remove();

  // Restore position if we changed it
  if (element.getAttribute(ORIGINAL_POSITION_ATTR) === "static") {
    element.style.position = "";
    element.removeAttribute(ORIGINAL_POSITION_ATTR);
  }

  // Remove z-index patches from children
  Array.from(element.children).forEach((child) => {
    const el = child as HTMLElement;
    if (el.getAttribute("data-color-input-z-patched") === "true") {
      el.style.zIndex = "";
      el.removeAttribute("data-color-input-z-patched");
    }
  });
}

/** Convert rgb(...) / rgba(...) to hex */
function rgbToHex(value: string): string {
  if (!value.startsWith("rgb")) return value;
  const rgb = value.match(/\d+/g);
  if (rgb && rgb.length >= 3) {
    return (
      "#" +
      (
        (1 << 24) +
        (parseInt(rgb[0]) << 16) +
        (parseInt(rgb[1]) << 8) +
        parseInt(rgb[2])
      )
        .toString(16)
        .slice(1)
    );
  }
  return "#000000";
}

/** Convert hsl(h, s%, l%) string to hex */
function hslToHex(value: string): string {
  const match = value.match(/hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)/i);
  if (!match) return "#000000";
  const h = parseFloat(match[1]);
  const s = parseFloat(match[2]) / 100;
  const l = parseFloat(match[3]) / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, "0");
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

/**
 * Try to parse any supported color format (hex, rgb, hsl) into a hex string
 * for the native color picker. Returns null if the value is not yet complete.
 */
function parseColorToHex(value: string): string | null {
  const v = value.trim();

  // Already a valid hex (#abc or #aabbcc)
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v)) {
    return v.length === 4
      ? "#" + v[1] + v[1] + v[2] + v[2] + v[3] + v[3]
      : v;
  }

  // rgb(r, g, b)
  if (/^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/i.test(v)) {
    return rgbToHex(v);
  }

  // hsl(h, s%, l%)
  if (/^hsl\(\s*[\d.]+\s*,\s*[\d.]+%\s*,\s*[\d.]+%\s*\)$/i.test(v)) {
    return hslToHex(v);
  }

  return null;
}

const ColorInput: React.FC<ColorInputProps> = ({ element, mode, Bgcolor }) => {
  const [color, setColor] = useState("#000000");
  // Whether an overlay-based background is currently applied
  const [overlayActive, setOverlayActive] = useState(false);
  // Track copy feedback state
  const [isCopied, setIsCopied] = useState(false);

  // Ref to track the element we last operated on so we can clean up on change
  const lastElementRef = useRef<HTMLElement | null>(null);

  const getInitialColor = (el: HTMLElement): string => {
    let value = "#000000";
    switch (mode) {
      case "color":
        value = getComputedStyle(el).color;
        break;
      case "backgroundColor":
        value = getComputedStyle(el).backgroundColor;
        break;
      case "background":
        value = getComputedStyle(el).background;
        break;
      case "textGradient":
        value = getComputedStyle(el).background || "#000000";
        break;
      case "borderColor":
        value = getComputedStyle(el).borderColor ||  "#000000";;
        break;
      case "shadowColor": {
        const boxShadow = getComputedStyle(el).boxShadow;
        const match = boxShadow.match(/rgba?\([^)]+\)|#[0-9a-fA-F]+/);
        value = match ? match[0] : "#000000";
        break;
      }
      default:
        value = "#000000";
    }
    return rgbToHex(value);
  };

  // On element/mode/Bgcolor change: clean up old overlay if element changed
  useEffect(() => {
    const prev = lastElementRef.current;

    // If the element changed, remove overlay from old element
    if (prev && prev !== element) {
      removeOverlay(prev);
      setOverlayActive(false);
    }

    lastElementRef.current = element ?? null;

    if (!element) {
      setColor("#000000");
      setOverlayActive(false);
      return;
    }

    // Check if there's already an active overlay on the new element
    const existingOverlay = element.querySelector(
      `[${OVERLAY_ATTR}]`
    ) as HTMLDivElement | null;
    if (existingOverlay && mode === "backgroundColor") {
      const bg = existingOverlay.style.backgroundColor || existingOverlay.style.background;
      setColor(bg || "#000000");
      setOverlayActive(true);
    } else {
      const initial = Bgcolor || getInitialColor(element);
      setColor(initial);
      setOverlayActive(false);
    }
  }, [element, mode, Bgcolor]);

  // Cleanup overlay when component unmounts
  useEffect(() => {
    return () => {
      const el = lastElementRef.current;
      if (el) removeOverlay(el);
    };
  }, []);

  const handleChange = (value: string, fromText = false) => {
    if (!element) return;
    setColor(value);

    // When typing in the text field, only apply to the element once we have a
    // complete, valid color. The native color picker always gives a valid hex.
    if (fromText) {
      const hex = parseColorToHex(value);
      if (!hex) return; // still mid-typing — update display only
      applyColor(hex);
    } else {
      applyColor(value);
    }

    // border add stroke on change

    if (mode === "borderColor" && element) {
      const computed = getComputedStyle(element);
    
      const widths = [
        computed.borderTopWidth,
        computed.borderRightWidth,
        computed.borderBottomWidth,
        computed.borderLeftWidth,
      ].map((v) => parseFloat(v || "0"));
    
      const styles = [
        computed.borderTopStyle,
        computed.borderRightStyle,
        computed.borderBottomStyle,
        computed.borderLeftStyle,
      ];
    
      const hasVisibleBorder =
        widths.some((w) => w > 0) &&
        styles.some((s) => s !== "none" && s !== "hidden");
    
      // Only when user changes border color
      if (!hasVisibleBorder) {
        element.style.border = `1px solid ${value}`;
      }
    }
    
    applyColor(value);
  };

  const applyColor = (value: string) => {
    if (!element) return;
    switch (mode) {
      case "color":
        element.style.color = value;
        break;

      case "backgroundColor": {
        // Use overlay layer instead of modifying element directly
        const overlay = getOrCreateOverlay(element);
        overlay.style.background = value;
        overlay.style.backgroundColor = value;
        setOverlayActive(true);
        break;
      }

      case "background":
        element.style.background = value;
        break;

      case "textGradient":
        element.style.background = value;
        element.style.webkitBackgroundClip = "text";
        element.style.webkitTextFillColor = "transparent";
        break;

      case "borderColor":
        element.style.borderColor = value;
        break;

      case "shadowColor":
        element.style.boxShadow = `0px 4px 10px ${value}`;
        break;

      default:
        break;
    }
  };

  const handleReset = () => {
    if (!element) return;

    if (mode === "backgroundColor") {
      removeOverlay(element);
      setOverlayActive(false);
      // Reflect the element's actual background now that overlay is gone
      const restored = rgbToHex(getComputedStyle(element).backgroundColor);
      setColor(restored || "#000000");
    } else {
      // For other modes, clear the inline style
      switch (mode) {
        case "color":
          element.style.color = "";
          break;
        case "background":
          element.style.background = "";
          break;
        case "textGradient":
          element.style.background = "";
          element.style.webkitBackgroundClip = "";
          element.style.webkitTextFillColor = "";
          break;
        case "borderColor":
          element.style.borderColor = "";
          break;
        case "shadowColor":
          element.style.boxShadow = "";
          break;
        default:
          break;
      }
      const restored = getInitialColor(element);
      setColor(restored);
    }
  };

  const handleCopyColor = async () => {
    try {
      await navigator.clipboard.writeText(color);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const showResetButton =
    mode === "backgroundColor"
      ? overlayActive
      : !!element?.style.getPropertyValue(
          mode === "color"
            ? "color"
            : mode === "borderColor"
            ? "border-color"
            : mode === "shadowColor"
            ? "box-shadow"
            : "background"
        );

  const displayValue =
    color?.includes("linear-gradient") || color?.includes("radial-gradient")
      ? "Gradient"
      : color === "transparent"
      ? "transparent"
      : color;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        // border: "1px solid #303030",
        borderRadius: "12px",
        padding: "3px",
        width: "140px",
        position: "relative",
      }}
    >
      {/* Color swatch — styled div over a hidden native input */}
      <div
        style={{
          position: "relative",
          width: "20px",
          height: "20px",
          flexShrink: 0,
        }}
      >
        {/* Visible circle swatch */}
        <div
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            background: color.startsWith("#") || color.startsWith("rgb") || color.startsWith("hsl") ? color : "#000000",
            border: "1px solid rgba(255,255,255,0.15)",
            boxSizing: "border-box",
            pointerEvents: "none",
          }}
        />
        {/* Native color picker — invisible but fully covers the swatch div */}
        <input
          type="color"
          value={color.startsWith("#") ? color : "#000000"}
          onChange={(e) => handleChange(e.target.value, false)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0,
            cursor: "pointer",
            border: "none",
            padding: 0,
            margin: 0,
          }}
        />
      </div>

      {/* Text input — accepts hex, rgb(...), hsl(...). Click to select all. */}
      <input
        type="text"
        value={displayValue}
        onChange={(e) => handleChange(e.target.value, true)}
        onClick={(e) => (e.currentTarget as HTMLInputElement).select()}
        placeholder="#000000"
        style={{
          flex: 1,
          minWidth: 0,
          padding: "4px 2px",
          border: "none",
          outline: "none",
          backgroundColor: "transparent",
          borderRadius: "4px",
          color: "gray",
          fontSize: "16px",
          fontWeight:'600'
        }}
      />

      {/* Copy button — always visible, checkmark on successful copy */}
      <button
        onClick={handleCopyColor}
        title={isCopied ? "Copied!" : "Copy color code"}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: isCopied ? "#4ade80" : "gray",
          borderRadius: "4px",
          transition: "color 0.2s ease",
        }}
        onMouseEnter={(e) => {
          if (!isCopied) {
            ((e.currentTarget as HTMLButtonElement).style.color = "#fff");
          }
        }}
        onMouseLeave={(e) => {
          if (!isCopied) {
            ((e.currentTarget as HTMLButtonElement).style.color = "#e0e0e0");
          }
        }}
      >
        {isCopied ? (
          // Checkmark icon - success feedback
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.5 3.5L5.25 10.5L2.5 7.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          // Copy icon - default state
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.5 5.5H2.5C2.23478 5.5 1.98043 5.6054 1.79289 5.79289C1.6054 5.98043 1.5 6.23478 1.5 6.5V11.5C1.5 11.7652 1.6054 12.0196 1.79289 12.2071C1.98043 12.3946 2.23478 12.5 2.5 12.5H7.5C7.76522 12.5 8.01957 12.3946 8.20711 12.2071C8.3946 12.0196 8.5 11.7652 8.5 11.5V9.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 2H11.5C11.7652 2 12.0196 2.10536 12.2071 2.29289C12.3946 2.48043 12.5 2.73478 12.5 3V8.5C12.5 8.76522 12.3946 9.01957 12.2071 9.20711C12.0196 9.3946 11.7652 9.5 11.5 9.5H9C8.73478 9.5 8.48043 9.3946 8.29289 9.20711C8.1054 9.01957 8 8.76522 8 8.5V3C8 2.73478 8.1054 2.48043 8.29289 2.29289C8.48043 2.10536 8.73478 2 9 2Z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Reset / remove button — only shown when a color has been applied */}
      {showResetButton && (
        <button
          onClick={handleReset}
          title={
            mode === "backgroundColor"
              ? "Remove background overlay"
              : "Reset color"
          }
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "2px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: "#888",
            borderRadius: "4px",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = "#ff6b6b")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = "#888")
          }
        >
          {/* X icon */}
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="6" cy="6" r="5.5" stroke="currentColor" strokeWidth="1" />
            <path
              d="M4 4L8 8M8 4L4 8"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ColorInput;