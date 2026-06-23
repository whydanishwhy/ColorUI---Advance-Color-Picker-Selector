import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import 'tippy.js/dist/tippy.css';


const GLOBAL_KEY = "__MY_EXTENSION_COLORUI_MOUNTED__";
const HOST_ID = "__EXT_HOST__COLORUI";

// Avoid double mounting
if (!(window as any)[GLOBAL_KEY]) {
  (window as any)[GLOBAL_KEY] = true;

  const createHost = () => {
    let host = document.getElementById(HOST_ID) as HTMLDivElement | null;

    if (!host) {
      host = document.createElement("div");
      host.id = HOST_ID;

      Object.assign(host.style, {
        position: "fixed",
        top: "24px",
        right: "24px",
        width: "350px",
        // height: "400px",
        // minHeight:"400px",
        maxHeight:"400px",
        zIndex: "2147483647",
        pointerEvents: "auto",
        fontSize:"12px"
      





      });

      document.body.appendChild(host);

      // Shadow DOM
      const shadow = host.attachShadow({ mode: "open" });

      // Container inside shadow
      const container = document.createElement("div");
      Object.assign(container.style, {
        width: "100%",
        height: "100%",
        background: "rgba(18,18,18,0.97)",
        color: "#f2f2f2",
        display: "flex",
        backdropFilter:"blur(12px)",
      
        border:"1px solid rgb(112 112 112 / 22%)",
        borderRadius:"15px",
        boxShadow:" 0 0 8px #000000",
        flexDirection: "column",
        // userSelect:"none"
      });

      shadow.appendChild(container);

      // Mount React
      let reactRoot: ReactDOM.Root | null = null;
      try {
        reactRoot = ReactDOM.createRoot(container);
        reactRoot.render(<App />);
      } catch (err) {
        console.error("React mount failed:", err);
      }

      // ⚡ Expose globally
      (window as any).__MY_EXTENSION__ = { host, shadow, container, reactRoot };

      Object.defineProperty(window, "__MY_EXTENSION__", {
        configurable: true,
        writable: true,
        value: (window as any).__MY_EXTENSION__,
      });
    }

    // ------------------- Filter Layer -------------------
    let filterLayer = document.getElementById("COLORUI__FILTER___LAYER") as HTMLDivElement | null;

    if (filterLayer) {
      filterLayer.remove(); // Remove existing filter layer
    } else {
      filterLayer = document.createElement("div");
      filterLayer.id = "COLORUI__FILTER___LAYER";
      Object.assign(filterLayer.style, {
        position: "fixed",
        inset: "0",
        zIndex: "9999",
        pointerEvents: "none",
        backdropFilter: "", // Initially empty
      });
      document.body.appendChild(filterLayer);
    }

    return host;
  };

  const waitForBody = (cb: () => void) => {
    if (document.body) return cb();
    setTimeout(() => waitForBody(cb), 50);
  };

  waitForBody(() => {
    createHost();

    // Observer to recreate host if removed
    const observer = new MutationObserver(() => {
      const host = document.getElementById(HOST_ID);
      if (!host) createHost();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });
}


