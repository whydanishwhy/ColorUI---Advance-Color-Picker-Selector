import { useState, useEffect, useRef } from "react";
import interact from "interactjs";
import Header from "../Components/Header";
import ColorBlindness from "../Components/ColorBlindness";
import Home from "../Components/Home";
import TagAndDraw from "../Components/FreeDraw";
import ColorSelector from '../Components/ColorSelector'
import VisualEditPro from "../Components/VisualEditPro";
import Notepad from "../Components/NotePad"
import Test from "../Components/Test"
import ColorUI from "../Components/ColorUI";
import Setting from "../Components/Setting";
import AskAI from "../Components/AskAI";
import { baseURL } from "../UI-Models/Constant";
import Orpheus from "../Components/Orpheus";
import axios from "axios";
import { button, div } from "framer-motion/client";
interface Area {
  x: number;
  y: number;
  w: number;
  h: number;
}

function App() {

  const [active, setActive] = useState("Home");

  // License Key
  const [isKeyValid, setisKeyValid] = useState(false);

  const [usageCount, setUsageCount] = useState(0);


  const [SettingPage, setSettingPage] = useState(false)

  const [isActive, setIsActive] = useState(false);


useEffect(()=>{
  MakePickerResizable()
  
},[])

  // ------------------- Download / Screenshot -------------------

  function MakePickerResizable() {
    const host = document.getElementById("__EXT_HOST__COLORUI");
    const container = host?.shadowRoot?.querySelector("div");

    if (host && container) {
     

      const appContainer = host

      if (appContainer) {
        interact("#__COLORUI_HEADER__").draggable({
          listeners: {
            move(event) {
              event.preventDefault(); 
              event.stopPropagation(); 

              appContainer.style.transition = "none";

              const target = event.target;
              const x =
                (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
              const y =
                (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

              appContainer.style.transform = `translate(${x}px, ${y}px)`;

              target.setAttribute("data-x", x);
              target.setAttribute("data-y", y);
            },
            end() {
              document.body.style.pointerEvents = "";
            },
          },
        });

    

      } else {
        console.error("#app-container not found in the shadow DOM.");
      }
    } else {
      console.error("Root div or shadow root not found.");
    }

    return () => {
      if (host && container) {
        const appContainer = host

        if (appContainer) {
          interact(appContainer).unset(); // Unset interact.js listeners
        }
      }
    };
  }

  const runEvery = async (
    key: string,
    days: number,
    fn: () => Promise<void> | void
  ) => {
    const now = Date.now();
  
    chrome.storage.local.get([key], async (res) => {
      const lastRun = res[key];
      const interval = days * 24 * 60 * 60 * 1000;
  
      if (!lastRun || now - lastRun > interval) {
        await fn();
  
        chrome.storage.local.set({
          [key]: now,
        });
      }
    });
  };

// For total three times in total 
const handleAction = async () => {
  const result = await chrome.storage.local.get(["usageCount"]);
  const usageCount = result.usageCount || 0;

  if ((isKeyValid === false || isKeyValid === null) && usageCount >= 3) {
    alert("Limit reached");
    console.log("Limit crossed")

    return;
  }

  // Perform action




  if (isKeyValid === false || isKeyValid === null) {
    await chrome.storage.local.set({
      usageCount: usageCount + 1,
    });
  }
};


  
  useEffect(() => {

    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.get(["active-license"], (result) => {
        const savedKey = result["active-license"];
        console.log(savedKey);
        setisKeyValid(savedKey);
      });
    }


    const fetchData = async () => {

      chrome.storage.local.get("active-license", async function (result) {
        console.log("Retrieved key: " + result.key);
        console.log("This time is RUnnned...!")

        if(result.key){

        try {
          const res = await axios.post(
            `${baseURL}/checklisence`,
            {
              licenseKey: result.key, // Assuming you want to use result.key as the license key
            }
          );
          console.log(res.data);
          if (res.data.message === "License Key Found") {
            setisKeyValid(true);
            console.log("VERIFY");
          }
        } catch (error) {
          console.error("Error during API call:", error);
        }

        }else{
          setisKeyValid(false)

        }



      });
    };

     runEvery(
      "license-refresh",
      3,
      async () => {
        await fetchData(); 

      }
    );
    
  }, []);


  return (
    <>
    <div
     
    >

    </div>
   <Header active={active}  isActive={isActive} setIsActive={setIsActive} setSettingPage={setSettingPage}  SettingPage={SettingPage} setActive={setActive}/>

{/* <div onClick={handleAction}>{isKeyValid}</div> */}

{/* <button onClick={handleAction}> click me</button> */}

    {SettingPage?<Setting  />:
    
    // <VisualEditPro handleAction={handleAction} isKeyValid={isKeyValid} setSettingPage={setSettingPage} isActive={isActive} setIsActive={setIsActive} />

    
 <div>
   { isKeyValid ? <button>Test button</button>:
  
  <div>Buy license first</div>}
 </div>
   
    
    }
    




     
    </>
  );
}

export default App;







  {/* <div style={{width:'100%', display:"flex", flexDirection:"column",gap:'20px', justifyContent:'center', alignItems:'center'
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



    </div> */}
