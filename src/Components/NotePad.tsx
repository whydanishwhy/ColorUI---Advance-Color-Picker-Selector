import React, { useEffect, useState } from "react";

const Notepad: React.FC = () => {
  const [msg, setMsg] = useState<string>("");


useEffect(()=>{

  const host = document.getElementById("__EXT_HOST__");
  const container = host?.shadowRoot?.querySelector("div");
  if(container){
    container.style.width = '600px';
    container.style.height = '600px';
  }
  return()=>{
    const host = document.getElementById("__EXT_HOST__");
  const container = host?.shadowRoot?.querySelector("div");
  if(container){
    container.style.width = '350px';
    container.style.height = '400px';
  }
    
  }
},[])

  useEffect(() => {
    const handleCopy = async (e: ClipboardEvent) => {
      try {
        // Read the current clipboard text
        const text = await navigator.clipboard.readText();

        // Append it to the message box
        setMsg(prev => (prev ? prev + "\n" + text : text));
      } catch (err) {
        console.error("Failed to read clipboard:", err);
      }
    };

    document.addEventListener("copy", handleCopy);

    return () => {
      document.removeEventListener("copy", handleCopy);
    };
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
   

      <div
        id="MsgBox"
        contentEditable={true}
        style={{
          marginTop: "20px",
          padding: "10px",
          border: "1px solid #ccc",
          minHeight: "100px",
          whiteSpace: "pre-wrap",
          background: "#242424",
          color:'gray',
          borderRadius:'8px',
          overflowY:'scroll'
        }}
      >
        {msg || "No text copied yet"}
      </div>
    </div>
  );
};

export default Notepad;
