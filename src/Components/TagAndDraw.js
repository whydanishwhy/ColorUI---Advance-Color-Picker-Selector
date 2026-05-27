import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import interact from 'interactjs';
const TagAndDraw = () => {
    useEffect(() => {
        interact(".__TAG").draggable({
            listeners: {
                move(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    document.body.style.pointerEvents = "none";
                    const target = event.target;
                    const x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
                    const y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;
                    target.style.transform = `translate(${x}px, ${y}px)`;
                    target.setAttribute("data-x", x);
                    target.setAttribute("data-y", y);
                },
                end() {
                    var _a;
                    document.body.style.pointerEvents = "";
                    const editableDiv = document.createElement('div');
                    editableDiv.style.color = 'gray';
                    editableDiv.style.padding = '20px';
                    editableDiv.style.fontSize = '22px';
                    editableDiv.className = '__TAG';
                    editableDiv.contentEditable = 'true';
                    editableDiv.textContent = 'Tag';
                    const host = document.getElementById("__EXT_HOST__");
                    const container = (_a = host === null || host === void 0 ? void 0 : host.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector("div");
                    if (container) {
                        container.appendChild(editableDiv);
                    }
                },
            },
        });
    }, []);
    return (_jsxs("div", { children: [_jsx("div", { style: { color: "gray", padding: '20px', fontSize: "22px" }, className: "__TAG", contentEditable: true, children: "Tag" }), _jsx("button", { style: { background: '#242424', borderRadius: '100%', padding: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: '20px', left: "20px"
                }, children: "Draw" })] }));
};
export default TagAndDraw;
