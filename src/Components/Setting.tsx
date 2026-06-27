import React,{useState, useEffect} from 'react'
import LisenceManagement from './LisenceManagement'
import Switch from '../UI-Models/Switch'
import { baseColor } from '../UI-Models/Constant'
import { motion } from "framer-motion";


const Setting = () => {
  const modes: ColorMode[] = ["RGB", "HEX", "HSL"];
  

  type ColorMode = "RGB" | "HEX" | "HSL";

const [selected, setSelected] = useState<ColorMode>("RGB");
const [disabledOnMedia, setDisabledOnMedia] = useState(false);
const [openPickerOnRun, setOpenPickerOnRun] = useState(false);

// Load saved values
useEffect(() => {
  chrome.storage.local.get(
    ["colorMode", "disabledOnMedia", "openPickerOnRun"],
    (result) => {
      setSelected(result.colorMode ?? "RGB");
      setDisabledOnMedia(result.disabledOnMedia ?? false);
      setOpenPickerOnRun(result.openPickerOnRun ?? false);
    }
  );
}, []);

// Save whenever anything changes
useEffect(() => {
  chrome.storage.local.set({
    colorMode: selected,
    disabledOnMedia,
    openPickerOnRun,
  });
}, [selected, disabledOnMedia, openPickerOnRun]);  
  
  
  return (
    <motion.div 
    initial={{
      opacity: 0,
      y: 20,
      scale: 0.96
    }}
    animate={{
      opacity: 1,
      y: 0,
      scale: 1
    }}
    
    style={{
      animation:"ss-popIn .22s cubic-bezier(0.34,1.56,0.64,1)",
      transformOrigin:"left",
    }}>
      <LisenceManagement  />
     
<div>
<div
  style={{
    display: 'flex',
    justifyContent: 'space-between',
    padding: '20px',
    alignItems: 'center'
  }}
>
  <div>Disable Effect on Media :</div>

  <Switch
    color={baseColor}
    checked={disabledOnMedia}
    onChange={() =>
      setDisabledOnMedia(prev => !prev)
    }
  />
</div>

<div
  style={{
    display: 'flex',
    justifyContent: 'space-between',
    padding: '20px',
    alignItems: 'center'
  }}
>
  <div>open Picker on run :</div>

  <Switch
    color={baseColor}
    checked={openPickerOnRun}
    onChange={() =>
      setOpenPickerOnRun(prev => !prev)
    }
  />
</div>
</div>

    <div
  style={{
    width: "300px",
    padding: "24px",
    borderRadius: "16px",
    background: "#181818",
    color: "white",
    fontFamily: "sans-serif"
  }}
>
  <h3
    style={{
      marginBottom: "18px"
    }}
  >
    Color Format
  </h3>

  <div
    style={{
      display: "flex",
      gap: "12px"
    }}
  >
    {modes.map((mode) => (
      <label
        key={mode}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
          padding: "10px 14px",
          // border:
          //   selected === mode
          //     ? "1px solid #7c3aed"
          //     : "1px solid #333",
          borderRadius: "12px",
          transition: "0.3s",
          // background:
          //   selected === mode
          //     ? "#2a1e45"
          //     : "#222"
        }}
      >
        <input
          type="radio"
          name="colorMode"
          value={mode}
          checked={selected === mode}
          onChange={() => setSelected(mode)}
          style={{
            display: "none"
          }}
        />

        <span
          style={{
            width: "14px",
            height: "14px",
            border:
              selected === mode
                ? `2px solid ${baseColor}`
                : "2px solid #666",
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: baseColor,
              transition: "0.3s",
              opacity: selected === mode ? 1 : 0
            }}
          />
        </span>

        {mode}
      </label>
    ))}
  </div>

  {/* 
  <div
    style={{
      marginTop: "20px",
      opacity: 0.8
    }}
  >
    Selected: <strong>{selected}</strong>
  </div> 
  */}
</div>

        
    </motion.div>
  )
}

export default Setting



