import React from "react";
import { baseColor } from "./Constant";

type SwitchProps = {
  checked?: boolean;
  color: string;
  onChange?: (checked: boolean) => void;
};

const Switch: React.FC<SwitchProps> = ({
  checked = false,
  onChange,
  color = baseColor,
}) => {

  const toggle = () => {
    onChange?.(!checked);
  };

  return (
    <div
      onClick={toggle}
      style={{
        width: "25px",
        height: "16px",
        backgroundColor: checked ? color : "#5d5d5d",
        borderRadius: "50px",
        padding: "3px",
        cursor: "pointer",
        transition: "background-color 0.3s ease",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "15px",
          height: "15px",
          backgroundColor: "#121212",
          borderRadius: "50%",
          transform: checked
            ? "translateX(9px)"
            : "translateX(0)",
          transition: "transform 0.3s ease",
        }}
      />
    </div>
  );
};

export default Switch;