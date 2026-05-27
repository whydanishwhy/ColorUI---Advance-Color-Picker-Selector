import React, { useEffect, useRef, useState, useCallback } from "react";
import interact from "interactjs";
import tippy, { Instance as TippyInstance, Props as TippyProps } from "tippy.js";
import "tippy.js/dist/tippy.css";
import InspectorSidebar from "./VisualEditor";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface ToolbarAction {
  id: string;
  icon: string;        // SVG string
  label: string;
  condition?: (el: HTMLElement) => boolean;
  onClick: (el: HTMLElement) => void;
  danger?: boolean;
}

interface Props {
  isActive: boolean;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
  isKeyValid: boolean;
  setSettingPage: React.Dispatch<React.SetStateAction<boolean>>;
}

// ─────────────────────────────────────────────
// SVG Icons (inline, no external deps)
// ─────────────────────────────────────────────
const Icons = {
  copyStyle: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  pasteStyle: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>`,
  editText: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>`,
  changeImage: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  duplicate: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  moveUp: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`,
  moveDown: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
  delete: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
  close: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
};

// ─────────────────────────────────────────────
// Floating Toolbar DOM element (lives outside React)
// Injected once into __EXT_HOST__, repositioned on select
// ─────────────────────────────────────────────
let toolbarEl: HTMLDivElement | null = null;
let tippyInstances: TippyInstance[] = [];
let copiedStyles: Partial<CSSStyleDeclaration> | null = null;

const EDITABLE_TAGS = new Set([
  "P","H1","H2","H3","H4","H5","H6","SPAN","DIV","LI","A","BUTTON","LABEL","TD","TH","CAPTION",
]);

const hasText = (el: HTMLElement) =>
  EDITABLE_TAGS.has(el.tagName) && (el.textContent?.trim().length ?? 0) > 0;

const isImage = (el: HTMLElement) =>
  el.tagName === "IMG" ||
  (el.tagName === "DIV" &&
    window.getComputedStyle(el).backgroundImage !== "none" &&
    window.getComputedStyle(el).backgroundImage !== "");

// ─────────────────────────────────────────────
// Toolbar positioning logic — handles edge overflow
// ─────────────────────────────────────────────
function positionToolbar(
  toolbar: HTMLDivElement,
  target: HTMLElement,
  containerEl: HTMLElement
) {
  const rect = target.getBoundingClientRect();
  const tbRect = toolbar.getBoundingClientRect();

  const vpW = window.innerWidth;
  const vpH = window.innerHeight;

  const GAP = 8;

  const TOOLBAR_W = tbRect.width || 260;
  const TOOLBAR_H = tbRect.height || 36;

  const SIDEBAR_W = 0; // adjust if your extension sidebar exists

  const isSmall =
    rect.width < 120 || rect.height < 42;

  let top = 0;
  let left = 0;

  type Placement =
  | "top"
  | "bottom"
  | "corner"
  | "top-corner"
  | "bottom-corner";

  let placement: Placement;
  // ─────────────────────────────
  // SMALL ELEMENT MODE (ICONS ONLY)
  // ─────────────────────────────
  if (isSmall) {
    placement = "corner";

    top = rect.top - 10;
    left = rect.right - 10;

    // fallback if offscreen
    if (top < 8) {
      top = rect.bottom + GAP;
      placement = "bottom-corner";
    }

    left = Math.min(left, vpW - TOOLBAR_W - SIDEBAR_W - 8);
  }

  // ─────────────────────────────
  // NORMAL MODE
  // ─────────────────────────────
  else {
    const canTop = rect.top - TOOLBAR_H - GAP > 8;
    const canBottom = rect.bottom + TOOLBAR_H + GAP < vpH - 8;

    if (canTop) {
      placement = "top";
      top = rect.top - TOOLBAR_H - GAP;
    } else if (canBottom) {
      placement = "bottom";
      top = rect.bottom + GAP;
    } else {
      placement = "top";
      top = Math.max(8, rect.top + GAP);
    }

    left =
      rect.left +
      rect.width / 2 -
      TOOLBAR_W / 2;

    left = Math.max(
      8,
      Math.min(left, vpW - TOOLBAR_W - SIDEBAR_W - 8)
    );
  }

  toolbar.style.top = `${top + window.scrollY}px`;
  toolbar.style.left = `${left + window.scrollX}px`;

  toolbar.setAttribute("data-placement", placement);
  toolbar.setAttribute("data-small", isSmall ? "true" : "false");
}

// ─────────────────────────────────────────────
// Build / rebuild the toolbar DOM
// ─────────────────────────────────────────────
function buildToolbar(
  target: HTMLElement,
  onDeselect: () => void,
  onDelete: (el: HTMLElement) => void,
  onEnterEdit: (el: HTMLElement) => void,
  containerEl: HTMLElement
): HTMLDivElement {
  // Destroy previous tippy instances
  tippyInstances.forEach((i) => i.destroy());
  tippyInstances = [];

  if (!toolbarEl) {
    toolbarEl = document.createElement("div");
    toolbarEl.id = "__vep_toolbar__";
    toolbarEl.setAttribute("role", "toolbar");
    toolbarEl.setAttribute("aria-label", "Element actions");
    containerEl.appendChild(toolbarEl);
  }

  // Inject styles once
  const styleId = "__vep_toolbar_style__";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      #__vep_toolbar__ {
        position: fixed;
        z-index: 2147483647;
        display: flex;
        align-items: center;
        gap: 1px;
        background: #18181b;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 10px;
        padding: 3px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.45), 0 1px 3px rgba(0,0,0,0.3);
        user-select: none;
        pointer-events: all;
        transition: opacity 0.15s ease, transform 0.15s ease;
        opacity: 0;
        transform: translateY(4px) scale(0.97);
        transform-origin: center bottom;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        will-change: transform, opacity;
      }
      #__vep_toolbar__.visible {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      #__vep_toolbar__[data-placement="below"] {
        transform-origin: center top;
      }
      #__vep_toolbar__ .vep-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border-radius: 7px;
        border: none;
        background: transparent;
        color: #a1a1aa;
        cursor: pointer;
        transition: background 0.12s ease, color 0.12s ease, transform 0.1s ease;
        flex-shrink: 0;
        outline: none;
        -webkit-tap-highlight-color: transparent;
      }
      #__vep_toolbar__ .vep-btn:hover {
        background: rgba(255,255,255,0.08);
        color: #f4f4f5;
        transform: scale(1.08);
      }
      #__vep_toolbar__ .vep-btn:active {
        transform: scale(0.93);
        background: rgba(255,255,255,0.12);
      }
      #__vep_toolbar__ .vep-btn.danger:hover {
        background: rgba(239,68,68,0.18);
        color: #f87171;
      }
      #__vep_toolbar__ .vep-btn.close-btn:hover {
        background: rgba(255,255,255,0.05);
        color: #71717a;
      }
      #__vep_toolbar__ .vep-divider {
        width: 1px;
        height: 18px;
        background: rgba(255,255,255,0.08);
        flex-shrink: 0;
        margin: 0 2px;
      }
      /* Tippy dark theme override for toolbar */
      #__vep_toolbar__ + .tippy-box,
      .tippy-box[data-theme="vep"] {
        background: #09090b;
        color: #e4e4e7;
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.01em;
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 6px;
        padding: 3px 7px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      }
      .tippy-box[data-theme="vep"] .tippy-arrow::before {
        color: #09090b;
      }
    `;
    document.head.appendChild(style);
  }

  // Define actions
  const actions: ToolbarAction[] = [
    {
      id: "copy-style",
      icon: Icons.copyStyle,
      label: "Copy styles",
      onClick: (el) => {
        const cs = window.getComputedStyle(el);
        const COPY_PROPS = [
          "color","backgroundColor","fontSize","fontWeight","fontFamily",
          "lineHeight","letterSpacing","textAlign","borderRadius","border",
          "padding","margin","opacity","boxShadow","display","flexDirection",
          "justifyContent","alignItems","gap","width","height",
        ] as const;
        copiedStyles = {};
        COPY_PROPS.forEach((p) => {
          if (copiedStyles) (copiedStyles as any)[p] = (cs as any)[p];
        });
        // Visual feedback: flash the button
        const btn = toolbarEl?.querySelector(`[data-action="copy-style"]`) as HTMLElement;
        if (btn) {
          btn.style.color = "#34d399";
          setTimeout(() => { btn.style.color = ""; }, 800);
        }
      },
    },
    {
      id: "paste-style",
      icon: Icons.pasteStyle,
      label: "Paste styles",
      condition: () => copiedStyles !== null,
      onClick: (el) => {
        if (!copiedStyles) return;
        // Only apply safe visual properties, not layout-breaking ones
        const SAFE = ["color","backgroundColor","fontSize","fontWeight","fontFamily",
          "lineHeight","letterSpacing","textAlign","borderRadius","border",
          "opacity","boxShadow"];
        SAFE.forEach((p) => {
          if (copiedStyles && (copiedStyles as any)[p]) {
            (el.style as any)[p] = (copiedStyles as any)[p];
          }
        });
      },
    },
    { id: "divider-1", icon: "", label: "", onClick: () => {} }, // placeholder for divider
    {
      id: "edit-text",
      icon: Icons.editText,
      label: "Edit text  (double-click)",
      condition: hasText,
      onClick: onEnterEdit,
    },
    {
      id: "change-image",
      icon: Icons.changeImage,
      label: "Change image",
      condition: isImage,
      onClick: (el) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = () => {
          const file = input.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (ev) => {
            if (el.tagName === "IMG") {
              (el as HTMLImageElement).src = ev.target?.result as string;
            } else {
              el.style.backgroundImage = `url(${ev.target?.result})`;
            }
          };
          reader.readAsDataURL(file);
        };
        input.click();
      },
    },
    { id: "divider-2", icon: "", label: "", onClick: () => {} },
    {
      id: "duplicate",
      icon: Icons.duplicate,
      label: "Duplicate element",
      onClick: (el) => {
        const clone = el.cloneNode(true) as HTMLElement;
        // Reset transform so it doesn't stack on top
        clone.style.transform = "";
        clone.removeAttribute("data-x");
        clone.removeAttribute("data-y");
        el.parentNode?.insertBefore(clone, el.nextSibling);
      },
    },
    {
      id: "move-up",
      icon: Icons.moveUp,
      label: "Move before sibling",
      condition: (el) => !!el.previousElementSibling,
      onClick: (el) => {
        el.previousElementSibling?.before(el);
      },
    },
    {
      id: "move-down",
      icon: Icons.moveDown,
      label: "Move after sibling",
      condition: (el) => !!el.nextElementSibling,
      onClick: (el) => {
        el.nextElementSibling?.after(el);
      },
    },
    { id: "divider-3", icon: "", label: "", onClick: () => {} },
    {
      id: "delete",
      icon: Icons.delete,
      label: "Delete element",
      danger: true,
      onClick: onDelete,
    },
    { id: "divider-4", icon: "", label: "", onClick: () => {} },
    {
      id: "close",
      icon: Icons.close,
      label: "Deselect  (Esc)",
      onClick: onDeselect,
    },
  ];

  // Clear & rebuild buttons
  toolbarEl.innerHTML = "";

  actions.forEach((action) => {
    // Divider
    if (action.id.startsWith("divider")) {
      const div = document.createElement("div");
      div.className = "vep-divider";
      toolbarEl!.appendChild(div);
      return;
    }

    // Skip if condition not met
    if (action.condition && !action.condition(target)) return;

    const btn = document.createElement("button");
    btn.className = `vep-btn${action.danger ? " danger" : ""}${action.id === "close" ? " close-btn" : ""}`;
    btn.setAttribute("data-action", action.id);
    btn.setAttribute("aria-label", action.label);
    btn.innerHTML = action.icon;
    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    });
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      action.onClick(target);
    });

    // Tippy tooltip
    const instance = tippy(btn, {
      content: action.label,
      theme: "vep",
      placement: "top",
      arrow: true,
      delay: [600, 0],
      duration: [150, 100],
      offset: [0, 8],
      appendTo: containerEl,
      zIndex: 2147483646,
    } as Partial<TippyProps>);
    tippyInstances.push(instance);

    toolbarEl!.appendChild(btn);
  });

  return toolbarEl;
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const VisualEditPro: React.FC<Props> = ({ isActive, setIsActive, isKeyValid, setSettingPage }) => {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [editingElement, setEditingElement] = useState<HTMLElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const isActiveRef = useRef(false);
  const isDraggingRef = useRef(false);
  const elementRef = useRef<HTMLElement | null>(null);
  const editingElementRef = useRef<HTMLElement | null>(null);
  const draggableRef = useRef<ReturnType<typeof interact> | null>(null);

  // mousedown-to-mouseup click guard
  const mousedownTargetRef = useRef<HTMLElement | null>(null);
  const mousedownPosRef = useRef({ x: 0, y: 0 });
  const didDragClickRef = useRef(false);

  useEffect(() => { isActiveRef.current = isActive; }, [isActive]);
  useEffect(() => { isDraggingRef.current = isDragging; }, [isDragging]);
  useEffect(() => { elementRef.current = element; }, [element]);
  useEffect(() => { editingElementRef.current = editingElement; }, [editingElement]);

  // ─── Helpers ───────────────────────────────
  const cleanupEditMode = useCallback((el: HTMLElement) => {
    if (!el) return;
    el.contentEditable = "false";
    el.style.outline = "";
    el.style.cursor = "";
  }, []);

  const cleanupSelection = useCallback((el: HTMLElement) => {
    if (!el) return;
    el.style.outline = "";
    el.style.outlineOffset = "";
  }, []);

  const hideToolbar = useCallback(() => {
    if (toolbarEl) {
      toolbarEl.classList.remove("visible");
    }
  }, []);

  const showToolbar = useCallback((target: HTMLElement) => {
    const host = document.getElementById("__EXT_HOST__");
    if (!host) return;

    const tb = buildToolbar(
      target,
      // onDeselect
      () => {
        if (elementRef.current) {
          cleanupSelection(elementRef.current);
          setElement(null);
        }
        if (editingElementRef.current) {
          cleanupEditMode(editingElementRef.current);
          setEditingElement(null);
        }
        hideToolbar();
      },
      // onDelete
      (el) => {
        hideToolbar();
        cleanupSelection(el);
        setElement(null);
        el.remove();
      },
      // onEnterEdit
      (el) => {
        el.contentEditable = "true";
        el.focus();
        el.style.outline = "2px solid #10b981";
        el.style.cursor = "text";
        setEditingElement(el);
      },
      host
    );

    // Position before making visible so we have correct rect
    positionToolbar(tb, target, host);

    // Animate in
    requestAnimationFrame(() => {
      tb.classList.add("visible");
    });
  }, [cleanupSelection, cleanupEditMode, hideToolbar]);

  // ─── Reposition toolbar on scroll/resize ───
  useEffect(() => {
    const onScrollOrResize = () => {
      if (elementRef.current && toolbarEl && toolbarEl.classList.contains("visible")) {
        const host = document.getElementById("__EXT_HOST__");
        if (host) positionToolbar(toolbarEl, elementRef.current, host);
      }
    };
    window.addEventListener("scroll", onScrollOrResize, { passive: true, capture: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, []);

  // ─── Friction CSS (no pointer-events suppression on a/button) ───
  useEffect(() => {
    const styleId = "__vep_friction_style__";
    if (isActive) {
      if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
          body * { -webkit-user-drag: none !important; user-drag: none !important; }
          img    { pointer-events: none !important; }
          body   { user-select: none !important; -webkit-user-select: none !important; }
        `;
        document.head.appendChild(style);
      }
    } else {
      document.getElementById(styleId)?.remove();
    }
    return () => { document.getElementById(styleId)?.remove(); };
  }, [isActive]);

  // ─── Draggable ──────────────────────────────
  useEffect(() => {
    if (!element || !isActive) return;
    const host = document.getElementById("__EXT_HOST__");

    draggableRef.current = interact(element)
      .draggable({
        inertia: true,
        listeners: {
          start(event) {
            if (!isActiveRef.current) return;
            const target = event.target as HTMLElement;
            if (host?.contains(target)) return;
            target.classList.add("no-select");
            isDraggingRef.current = true;
            setIsDragging(true);
            target.style.cursor = "move";
            target.style.transition = "none";
            document.body.style.userSelect = "none";
            document.body.style.webkitUserSelect = "none";
            hideToolbar();
          },
          move(event) {
            if (!isActiveRef.current) return;
            const target = event.target as HTMLElement;
            if (host?.contains(target) || editingElementRef.current) return;
            const x = (parseFloat(target.getAttribute("data-x") || "0") || 0) + event.dx;
            const y = (parseFloat(target.getAttribute("data-y") || "0") || 0) + event.dy;
            target.style.transform = `translate(${x}px, ${y}px)`;
            target.setAttribute("data-x", x.toString());
            target.setAttribute("data-y", y.toString());
          },
          end(event) {
            const target = event.target as HTMLElement;
            if (host?.contains(target)) return;
            target.classList.remove("no-select");
            target.style.cursor = "";
            document.body.style.userSelect = "";
            document.body.style.webkitUserSelect = "";
            setTimeout(() => {
              isDraggingRef.current = false;
              setIsDragging(false);
              if (elementRef.current) showToolbar(elementRef.current);
            }, 160);
          },
        },
      })
      .resizable({
        edges: { right: true, bottom: true, left: false, top: false },
        inertia: true,
        listeners: {
          move(event) {
            if (!isActiveRef.current) return;
            const target = event.target as HTMLElement;
            target.style.maxWidth = "";
            target.style.maxHeight = "";
            target.style.minHeight = "";
            target.style.minWidth = "";
            target.style.width = `${event.rect.width}px`;
            target.style.height = `${event.rect.height}px`;
          },
        },
      });

    return () => {
      draggableRef.current?.unset();
      draggableRef.current = null;
    };
  }, [element, isActive, hideToolbar, showToolbar]);

  // ─── Deactivate cleanup ─────────────────────
  useEffect(() => {
    if (!isActive) {
      if (editingElementRef.current) {
        cleanupEditMode(editingElementRef.current);
        setEditingElement(null);
      }
      if (elementRef.current) {
        cleanupSelection(elementRef.current);
        setElement(null);
      }
      draggableRef.current?.unset();
      draggableRef.current = null;
      hideToolbar();
    }
  }, [isActive, cleanupEditMode, cleanupSelection, hideToolbar]);

  // ─── Core event listeners ───────────────────
  useEffect(() => {
    const host = document.getElementById("__EXT_HOST__");

    const isEditorTarget = (e: Event): boolean => {
      if (!(e.target instanceof Element)) return true;
      const el = e.target as HTMLElement;
      return el.tagName === "BODY" || !!el.closest("#__EXT_HOST__") || !!el.closest("#__vep_toolbar__");
    };

    // ── Suppress ALL native triggers in capture phase ──
    const suppressNative = (e: Event) => {
      if (!isActiveRef.current) return;
      if (isEditorTarget(e)) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    };

    // ── mousedown: record intent ──
    const handleMouseDown = (e: MouseEvent) => {
      if (!isActiveRef.current) return;
      if (isEditorTarget(e)) return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const raw = e.target as HTMLElement;
      // Walk up to nearest meaningful target
      const resolved =
        (raw.closest("a") as HTMLElement) ??
        (raw.closest("button") as HTMLElement) ??
        raw;

      mousedownTargetRef.current = resolved;
      mousedownPosRef.current = { x: e.clientX, y: e.clientY };
      didDragClickRef.current = false;
    };

    // ── mousemove: detect drag intent ──
    const handleMouseMoveCapture = (e: MouseEvent) => {
      if (!mousedownTargetRef.current) return;
      const dx = Math.abs(e.clientX - mousedownPosRef.current.x);
      const dy = Math.abs(e.clientY - mousedownPosRef.current.y);
      if (dx > 4 || dy > 4) didDragClickRef.current = true;
    };

    // ── mouseup: commit selection ──
    const handleMouseUp = (e: MouseEvent) => {
      if (!isActiveRef.current || !mousedownTargetRef.current) return;
      if (isEditorTarget(e)) { mousedownTargetRef.current = null; return; }

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const target = mousedownTargetRef.current;
      mousedownTargetRef.current = null;

      if (didDragClickRef.current) return; // was a drag, not a click

      // Exit edit mode if clicking a different element
      if (editingElementRef.current && editingElementRef.current !== target) {
        cleanupEditMode(editingElementRef.current);
        setEditingElement(null);
      }

      // Clear previous selection
      if (elementRef.current && elementRef.current !== target) {
        cleanupSelection(elementRef.current);
      }

      target.style.outline = "3px dashed #3b82f6";
      target.style.outlineOffset = "2px";
      setElement(target);
      showToolbar(target);
    };

    // ── dblclick: enter text edit ──
    const handleDoubleClick = (e: MouseEvent) => {
      if (!isActiveRef.current || isDraggingRef.current) return;
      if (isEditorTarget(e)) return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const raw = e.target as HTMLElement;
      const resolved =
        (raw.closest("a") as HTMLElement) ??
        (raw.closest("button") as HTMLElement) ??
        raw;

      if (editingElementRef.current && editingElementRef.current !== resolved) {
        cleanupEditMode(editingElementRef.current);
      }

      if (!EDITABLE_TAGS.has(resolved.tagName)) return;

      resolved.contentEditable = "true";
      resolved.focus();
      resolved.style.outline = "2px solid #10b981";
      resolved.style.cursor = "text";

      try {
        const sel = window.getSelection();
        const range = document.caretRangeFromPoint?.(e.clientX, e.clientY) ?? null;
        if (range && sel) {
          sel.removeAllRanges();
          sel.addRange(range);
        } else {
          const fb = document.createRange();
          fb.selectNodeContents(resolved);
          fb.collapse(false);
          sel?.removeAllRanges();
          sel?.addRange(fb);
        }
      } catch {}

      setEditingElement(resolved);
      setElement(resolved);
      hideToolbar(); // hide while editing; show again on Escape
    };

    // ── hover highlight ──
    const handleOver = (e: MouseEvent) => {
      if (!isActiveRef.current || isDraggingRef.current) return;
      if (isEditorTarget(e)) return;
      const t = e.target as HTMLElement;
      if (t !== elementRef.current && t !== editingElementRef.current) {
        t.style.outline = "3px dashed rgba(59,130,246,0.8)";
        t.style.outlineOffset = "2px";
      }
    };

    const handleOut = (e: MouseEvent) => {
      if (!isActiveRef.current || isDraggingRef.current) return;
      const t = e.target as HTMLElement;
      if (!t || host?.contains(t) || t.tagName === "BODY") return;
      if (t.id === "__vep_toolbar__" || t.closest?.("#__vep_toolbar__")) return;
      if (t !== elementRef.current && t !== editingElementRef.current) {
        t.style.outline = "";
        t.style.outlineOffset = "";
      }
    };

    // ── keyboard ──
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActiveRef.current) return;

      // Escape: exit edit → back to select, or deselect all
      if (e.key === "Escape") {
        if (editingElementRef.current) {
          cleanupEditMode(editingElementRef.current);
          const el = editingElementRef.current;
          el.style.outline = "3px dashed #3b82f6";
          el.style.outlineOffset = "2px";
          setEditingElement(null);
          showToolbar(el);
          e.preventDefault();
          e.stopPropagation();
        } else if (elementRef.current) {
          cleanupSelection(elementRef.current);
          setElement(null);
          hideToolbar();
          e.preventDefault();
          e.stopPropagation();
        }
      }

      // Delete/Backspace: delete selected (not while editing)
      if ((e.key === "Delete" || e.key === "Backspace") && !editingElementRef.current) {
        if (elementRef.current) {
          const el = elementRef.current;
          hideToolbar();
          cleanupSelection(el);
          setElement(null);
          el.remove();
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    const handleSelectStart = (e: Event) => {
      if (isActiveRef.current && isDraggingRef.current && !editingElementRef.current) {
        e.preventDefault();
      }
    };

    // Register all
    document.addEventListener("mousedown",   handleMouseDown,       { capture: true });
    document.addEventListener("mousemove",   handleMouseMoveCapture,{ capture: true, passive: true });
    document.addEventListener("mouseup",     handleMouseUp,         { capture: true });
    document.addEventListener("dblclick",    handleDoubleClick,     { capture: true });
    document.addEventListener("click",       suppressNative,        { capture: true });
    document.addEventListener("contextmenu", suppressNative,        { capture: true });
    document.addEventListener("dragstart",   suppressNative,        { capture: true });
    document.addEventListener("focus",       suppressNative,        { capture: true });
    document.addEventListener("submit",      suppressNative,        { capture: true });
    document.addEventListener("mouseover",   handleOver,            { capture: true });
    document.addEventListener("mouseout",    handleOut,             { capture: true });
    document.addEventListener("keydown",     handleKeyDown,         { capture: true });
    document.addEventListener("selectstart", handleSelectStart,     { capture: true });

    return () => {
      document.removeEventListener("mousedown",   handleMouseDown,        true);
      document.removeEventListener("mousemove",   handleMouseMoveCapture, true);
      document.removeEventListener("mouseup",     handleMouseUp,          true);
      document.removeEventListener("dblclick",    handleDoubleClick,      true);
      document.removeEventListener("click",       suppressNative,         true);
      document.removeEventListener("contextmenu", suppressNative,         true);
      document.removeEventListener("dragstart",   suppressNative,         true);
      document.removeEventListener("focus",       suppressNative,         true);
      document.removeEventListener("submit",      suppressNative,         true);
      document.removeEventListener("mouseover",   handleOver,             true);
      document.removeEventListener("mouseout",    handleOut,              true);
      document.removeEventListener("keydown",     handleKeyDown,          true);
      document.removeEventListener("selectstart", handleSelectStart,      true);

      if (elementRef.current) cleanupSelection(elementRef.current);
      if (editingElementRef.current) cleanupEditMode(editingElementRef.current);
      hideToolbar();
    };
  }, [cleanupEditMode, cleanupSelection, showToolbar, hideToolbar]);

  return (
    <div>
      <InspectorSidebar
        isKeyValid={isKeyValid}
        setSettingPage={setSettingPage}
        isActive={isActive}
        setIsActive={setIsActive}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        isDraggingRef={isDraggingRef}
        element={element}
      />
    </div>
  );
};

export default VisualEditPro;