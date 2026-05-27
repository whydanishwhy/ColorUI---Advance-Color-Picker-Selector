import { createPortal } from "react-dom";
export function CustomFilterLayerPortal({ children }) {
    const container = document.getElementById("custom-filter-layer");
    if (!container)
        return null;
    return createPortal(children, container);
}
