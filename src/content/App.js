import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import interact from "interactjs";
import Header from "../Components/Header";
import VisualEditPro from "../Components/VisualEditPro";
import Setting from "../Components/Setting";
import { baseURL } from "../UI-Models/Constant";
import axios from "axios";
function App() {
    const [active, setActive] = useState("Home");
    const [isKeyValid, setisKeyValid] = useState(false);
    const [SettingPage, setSettingPage] = useState(false);
    const [isActive, setIsActive] = useState(false);
    useEffect(() => {
        MakePickerResizable();
    }, []);
    // ------------------- Download / Screenshot -------------------
    function MakePickerResizable() {
        var _a;
        const host = document.getElementById("__EXT_HOST__");
        const container = (_a = host === null || host === void 0 ? void 0 : host.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector("div");
        if (host && container) {
            const appContainer = host;
            if (appContainer) {
                interact("#__CHROMALENS_HEADER__").draggable({
                    listeners: {
                        move(event) {
                            event.preventDefault();
                            event.stopPropagation();
                            appContainer.style.transition = "none";
                            const target = event.target;
                            const x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
                            const y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;
                            appContainer.style.transform = `translate(${x}px, ${y}px)`;
                            target.setAttribute("data-x", x);
                            target.setAttribute("data-y", y);
                        },
                        end() {
                            document.body.style.pointerEvents = "";
                        },
                    },
                });
            }
            else {
                console.error("#app-container not found in the shadow DOM.");
            }
        }
        else {
            console.error("Root div or shadow root not found.");
        }
        return () => {
            if (host && container) {
                const appContainer = host;
                if (appContainer) {
                    interact(appContainer).unset(); // Unset interact.js listeners
                }
            }
        };
    }
    useEffect(() => {
        var _a;
        if (typeof chrome !== "undefined" && ((_a = chrome.storage) === null || _a === void 0 ? void 0 : _a.local)) {
            chrome.storage.local.get(["active-license"], (result) => {
                const savedKey = result["active-license"];
                console.log(savedKey);
                setisKeyValid(savedKey);
            });
        }
        const fetchData = async () => {
            chrome.storage.local.get("active-license", async function (result) {
                console.log("Retrieved key: " + result.key);
                if (result.key) {
                    try {
                        const res = await axios.post(`${baseURL}/checklisence`, {
                            licenseKey: result.key, // Assuming you want to use result.key as the license key
                        });
                        console.log(res.data);
                        if (res.data.message === "License Key Found") {
                            setisKeyValid(true);
                            console.log("VERIFY");
                        }
                    }
                    catch (error) {
                        console.error("Error during API call:", error);
                    }
                }
                else {
                    setisKeyValid(false);
                }
            });
        };
        // fetchData(); 
    }, []);
    return (_jsxs(_Fragment, { children: [_jsx("div", {}), _jsx(Header, { active: active, isActive: isActive, setIsActive: setIsActive, setSettingPage: setSettingPage, SettingPage: SettingPage, setActive: setActive }), SettingPage ? _jsx(Setting, {}) : _jsx(VisualEditPro, { isKeyValid: isKeyValid, setSettingPage: setSettingPage, isActive: isActive, setIsActive: setIsActive })] }));
}
export default App;
{ /* <div style={{width:'100%', display:"flex", flexDirection:"column",gap:'20px', justifyContent:'center', alignItems:'center'
}}>
    <nav
style={{
  backgroundColor: "#242424",
  padding: "10px",
  borderRadius: "16px",
  boxShadow: "inset 0px 4px 4px rgba(255, 255, 255, 0.07)",
}}
>
<ul
  style={{
    listStyle: "none",
    display: "flex",
    gap: "30px",
    margin: 0,
    padding: 0,
  }}
>
  {menuItems.map((item) => {
    const isActive = active === item;

    return (
      <li
        key={item}
        onClick={() => setActive(item)}
        style={{
          cursor: "pointer",
          paddingBottom: "5px",
          padding: "6px 12px",
          borderRadius: "8px",
          fontWeight: 500,
          color: isActive ? "#f2f2f2" : "grey",
          backgroundColor: isActive ? "#171717" : "transparent",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.color = "#f2f2f2";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.color = isActive
            ? "#f2f2f2"
            : "grey";
        }}
      >
        {item}
      </li>
    );
  })}
</ul>
</nav>


    {active === "Home" && (
   <div>
      <Home setSelectArea={setSelectArea} />
   </div>
    )}

    {active === "Filter" && (
      <div className="filter">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            alignItems: "center",
            width: "300px",
          }}
        >
          <span>Hue</span>
          <input type="range" min={0} max={360} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            alignItems: "center",
            width: "300px",
          }}
        >
          <span>Saturation</span>
          <input type="range" min={0} max={360} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            alignItems: "center",
            width: "300px",
          }}
        >
          <span>Temperature</span>
          <input type="range" min={0} max={360} />
        </div>
      </div>
    )}

    {active === "Blindness" && (
      <div className="blind">
<ColorBlindness />
      </div>
    )}



{active === "Setting" && (
      <div className="">
Setting Page
      </div>
    )}



  </div> */
}
