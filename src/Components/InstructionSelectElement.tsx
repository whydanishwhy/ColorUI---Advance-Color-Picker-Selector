import { MousePointer2 } from "lucide-react";
import { baseColor } from "../UI-Models/Constant";

const InstructionSelectElement = () => {
  return (
    <>
      <style>
        {`
          @keyframes pulseAnim {
            0% {
              transform: scale(1);
              opacity: 0.8;
            }
            70% {
              transform: scale(4);
              opacity: 0;
            }
            100% {
              opacity: 0;
            }
          }

          .pulse {
            position: absolute;
            inset: 0;
            border: 2px solid ${baseColor};
            border-radius: 50%;
            animation: pulseAnim 2s infinite;
            opacity: 0;
          }
        `}
      </style>

      <div
        style={{
          height: "300px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "20px",
            height: "20px",
          }}
        >
          <div
            style={{
              width: "20px",
              height: "20px",
              background: baseColor,
              borderRadius: "50%",
              zIndex: 2,
              position: "relative",
            }}
          />
                 <MousePointer2 size={24} />

          <div className="pulse" style={{ animationDelay: "0s" }} />
          <div className="pulse" style={{ animationDelay: "0.5s" }} />
          <div className="pulse" style={{ animationDelay: "1s" }} />
        </div>

 
        <p style={{fontSize:'18px', color:'#838383' }}>Select Element</p>
      </div>
    </>
  );
};

export default InstructionSelectElement;