import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
const ColorPicker = () => {
    const [colors, setColors] = useState([]);
    const [heights, setHeights] = useState([]);
    const [copyIndex, setCopyIndex] = useState(null);
    const [clickedItemIndex, setClickedItemIndex] = useState(null);
    // Handle item click (toggle)
    const handleItemClick = (index) => {
        setClickedItemIndex(prev => (prev === index ? null : index));
    };
    // Convert RGBA string to RGB
    const rgbaToRgb = (rgba) => {
        return rgba.replace(/,\s*[^,]+\)$/, ')');
    };
    // Pick a color using EyeDropper API
    const Pick = async () => {
        if (!('EyeDropper' in window)) {
            alert('The Eyedropper API is not supported in your browser.');
            return;
        }
        const eyeDropper = new window.EyeDropper();
        try {
            const result = await eyeDropper.open();
            setColors(prev => [rgbaToRgb(result.sRGBHex), ...prev]);
            setHeights(prev => ['70px', ...prev]);
            await navigator.clipboard.writeText(result.sRGBHex);
            console.log('Colors:', colors);
        }
        catch (err) {
            console.error('Eyedropper failed:', err);
        }
    };
    // Toggle pairing color box height
    const PairingColors = (index) => {
        setHeights(prev => {
            const newHeights = [...prev];
            newHeights[index] = newHeights[index] === '40px' ? '200px' : '40px';
            return newHeights;
        });
    };
    // Remove color
    const removeColor = (index) => {
        setColors(prev => prev.filter((_, i) => i !== index));
        setHeights(prev => prev.filter((_, i) => i !== index));
    };
    // Copy color to clipboard
    const CopyColor = async (color) => {
        try {
            await navigator.clipboard.writeText(color);
            console.log('Copied:', color);
        }
        catch (err) {
            console.error('Failed to copy:', err);
        }
    };
    return (_jsxs("div", { children: [_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px' }, children: colors.map((color, index) => (_jsx("div", { style: {
                        backgroundColor: color,
                        height: heights[index] || '60px',
                        width: '100%',
                        transition: '0.3s ease-in-out',
                        position: 'relative',
                        boxShadow: '0px 4px 4px rgba(0,0,0,0.25), inset 15px 12px 13.9px -1px rgba(0,0,0,0.35)',
                        borderRadius: '8px',
                    }, children: _jsxs("span", { style: {
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            height: '100%',
                            cursor: 'pointer',
                            position: 'relative',
                        }, children: [_jsxs("div", { style: {
                                    width: '100%',
                                    display: 'flex',
                                    height: '100%',
                                    cursor: 'pointer',
                                }, children: [_jsx("div", { className: "hiddenOpacity", onClick: () => PairingColors(index), style: {
                                            transform: heights[index] === '200px' ? 'rotate(90deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.3s ease-in-out',
                                            height: '70px',
                                            width: '60px',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }, children: _jsx("svg", { width: "12", height: "24", viewBox: "0 0 12 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M10.1569 12.7106L4.49994 18.3676L3.08594 16.9536L8.03594 12.0036L3.08594 7.05365L4.49994 5.63965L10.1569 11.2966C10.3444 11.4842 10.4497 11.7385 10.4497 12.0036C10.4497 12.2688 10.3444 12.5231 10.1569 12.7106Z", fill: "white" }) }) }), _jsx("div", { className: "no-opacity", onClick: () => {
                                            CopyColor(color);
                                            setCopyIndex(index);
                                            setTimeout(() => setCopyIndex(null), 1000);
                                        }, style: {
                                            height: '70px',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            width: '100%',
                                        }, children: copyIndex === index
                                            ? (_jsx("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { d: "M8.6 22.5L6.7 19.3L3.1 18.5L3.45 14.8L1 12L3.45 9.2L3.1 5.5L6.7 4.7L8.6 1.5L12 2.95L15.4 1.5L17.3 4.7L20.9 5.5L20.55 9.2L23 12L20.55 14.8L20.9 18.5L17.3 19.3L15.4 22.5L12 21.05L8.6 22.5ZM10.95 15.55L16.6 9.9L15.2 8.45L10.95 12.7L8.8 10.6L7.4 12L10.95 15.55Z", fill: "white" }) }))
                                            : heights[index] === '200px'
                                                ? 'Pairing Colors'
                                                : color })] }), _jsx("div", { className: "hiddenOpacity", onClick: () => removeColor(index), style: {
                                    position: 'absolute',
                                    right: '-5px',
                                    top: '-5px',
                                    width: '24px',
                                    height: '24px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRadius: '100%',
                                    color: 'white',
                                    border: '0.7px solid grey',
                                    cursor: 'pointer',
                                }, children: "X" }), heights[index] === '200px' && _jsx("div", { children: "Hello colors" })] }) }, index))) }), _jsx("button", { onClick: Pick, style: { marginTop: '20px' }, children: "Pick Color" })] }));
};
export default ColorPicker;
