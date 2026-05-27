import { createPortal } from "react-dom";

interface Props {
  children: React.ReactNode;
}

export function CustomFilterLayerPortal({ children }: Props) {
  const container = document.getElementById("custom-filter-layer");

  if (!container) return null;

  return createPortal(children, container);
}
