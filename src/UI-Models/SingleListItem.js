import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
// --- SingleListItem Component ---
const SingleListItem = ({ title, icon, Element, elementProps = {}, isFocused, isHidden, onClick, }) => {
    // ✅ LAZY MOUNT: track whether this item has ever been opened.
    // - On initial render: hasBeenOpened = false → Element is NOT mounted (no trigger storm).
    // - First time isFocused becomes true → hasBeenOpened = true → Element mounts.
    // - After that: Element stays mounted forever, just toggled with display:none.
    // This prevents all 11 panels from mounting simultaneously when VisualEditor mounts.
    const [hasBeenOpened, setHasBeenOpened] = useState(false);
    useEffect(() => {
        if (isFocused && !hasBeenOpened) {
            setHasBeenOpened(true);
        }
    }, [isFocused]);
    return (_jsxs("div", { className: `single-list-item ${isFocused ? 'focused' : ''}`, style: { display: isHidden ? 'none' : 'block' }, children: [_jsxs("div", { className: "header-row", style: { borderBottom: isFocused ? '1px solid #2a2a2a' : 'none' }, onClick: onClick, children: [_jsxs("div", { className: "left", children: [icon && _jsx("span", { children: icon }), _jsx("span", { style: {
                                    color: 'white',
                                    fontWeight: 500,
                                    fontSize: '16px',
                                }, children: title })] }), _jsx("div", { className: "arrow", children: isFocused ? '▲' : '▼' })] }), Element && isFocused && (_jsx("div", { className: "content", children: _jsx(Element, Object.assign({}, elementProps)) })), _jsx("style", { children: `
        .single-list-item {
          border-bottom: 1px solid #2a2a2a;
          background-color: #121212;
          transition: all 0.2s ease;
          transform: translateY(0);
          box-shadow: 0 0 0 rgba(0,0,0,0);
        }

        .single-list-item:not(.focused):hover {
          background-color: #1a1a1a;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        }

        .single-list-item.focused {
          background-color: #1a1a1a80;
          transform: translateY(0);
          box-shadow: 0 0 0 rgba(0,0,0,0);
        }

        .header-row {
          padding: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        }

        .left {
          display: flex;
          align-items: center;
          gap: 16px;
          color: gray;
          font-weight: 500;
        }

        .arrow {
          color: gray;
        }
      ` })] }));
};
export const SingleFocusLists = ({ initialLists }) => {
    const [focusedIndex, setFocusedIndex] = useState(null);
    const handleClick = (index) => {
        setFocusedIndex(prev => prev === index ? null : index);
    };
    const containerStyle = {
        width: '350px',
        maxHeight: '300px',
        fontFamily: 'Arial, sans-serif',
        borderRadius: '8px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'transparent',
    };
    const listsStyle = {
        flex: 1,
        overflowY: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
    };
    return (_jsxs("div", { style: containerStyle, children: [_jsx("div", { style: listsStyle, className: "hide-scrollbar", children: initialLists.map((list, index) => {
                    const isFocused = focusedIndex === index;
                    const isHidden = focusedIndex !== null && !isFocused;
                    return (_jsx(SingleListItem, { title: list.title, icon: list.icon, Element: list.Element, elementProps: list.elementProps, isFocused: isFocused, isHidden: isHidden, onClick: () => handleClick(index) }, index));
                }) }), _jsx("style", { children: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      ` })] }));
};
