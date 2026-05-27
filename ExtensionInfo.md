This is my chrome extension i have made in react in TS

it output me the content.js , manifest.json and i add background.js seperately which is in js

so this is my content body : import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import css from "./styles.css?inline";

const HOST_ID = "__my_extension_host__";
const Z_INDEX = "2147483647";

export function mountExtension() {
  // If already mounted, do nothing
  if (document.getElementById(HOST_ID)) return;

  // 1️⃣ Create host element
  const host = document.createElement("div");
  host.id = HOST_ID;

  Object.assign(host.style, {
    position: "fixed",
    top: "12px",
    right: "12px",
    zIndex: Z_INDEX,
    pointerEvents: "auto",
  });

  // 2️⃣ Attach shadow root
  const shadowRoot = host.attachShadow({ mode: "open" });

  // 3️⃣ Inject CSS safely into shadow
  const style = document.createElement("style");
  style.textContent = css;
  shadowRoot.appendChild(style);

  // 4️⃣ Create app container
  const appRoot = document.createElement("div");
  appRoot.id = "app-root";

  Object.assign(appRoot.style, {
    width: "400px",
    height: "500px",
    background: "#171717",
    color: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
    display: "flex",
    flexDirection: "column",
    userSelect:'none'
  });

  shadowRoot.appendChild(appRoot);
  document.body.appendChild(host);

  // 5️⃣ Mount React
  const root = ReactDOM.createRoot(appRoot);
  root.render(<App />);

  // 6️⃣ Cleanup support (optional but production-grade)
  window.addEventListener("beforeunload", () => {
    root.unmount();
    host.remove();
  });
}

