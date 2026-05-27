import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
const Joystick3D = ({ element, maxRotation = 180, }) => {
    const joystickRef = useRef(null);
    const stickRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const maxDistance = 45;
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging || !joystickRef.current || !stickRef.current || !element)
                return;
            const rect = joystickRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            let deltaX = e.clientX - centerX;
            let deltaY = e.clientY - centerY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            if (distance > maxDistance) {
                const angle = Math.atan2(deltaY, deltaX);
                deltaX = Math.cos(angle) * maxDistance;
                deltaY = Math.sin(angle) * maxDistance;
            }
            // move joystick knob
            stickRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            // calculate rotation
            const rotateY = (deltaX / maxDistance) * maxRotation;
            const rotateX = (-deltaY / maxDistance) * maxRotation;
            // apply 3D rotation
            element.style.transform = `
        perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
      `;
        };
        const handleMouseUp = () => {
            setIsDragging(false);
        };
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging, element, maxRotation]);
    return (_jsx("div", { ref: joystickRef, style: {
            width: 150,
            height: 150,
            background: "#222",
            borderRadius: "50%",
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 40,
        }, children: _jsx("div", { ref: stickRef, onMouseDown: () => setIsDragging(true), style: {
                width: 60,
                height: 60,
                background: "#555",
                borderRadius: "50%",
                cursor: "grab",
                position: "absolute",
            } }) }));
};
export default Joystick3D;
