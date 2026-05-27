import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Search, X } from "lucide-react";
const SearchBar = ({ query, onQueryChange }) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const containerStyle = { padding: "20px", backgroundColor: "#111" };
    const wrapperStyle = { position: "relative", width: "300px" };
    const iconStyle = {
        position: "absolute", top: "50%", left: "12px",
        transform: "translateY(-50%)", color: "gray", pointerEvents: "none",
    };
    const clearStyle = {
        position: "absolute", top: "50%", right: "10px",
        transform: "translateY(-50%)", color: "gray",
        cursor: "pointer", background: "none", border: "none", padding: 0,
        display: "flex", alignItems: "center",
    };
    const inputStyle = {
        width: "100%",
        padding: `10px ${query ? "32px" : "12px"} 10px 36px`,
        borderRadius: "14px",
        border: isFocused ? "1px solid #3B9D55" : "1px solid #323232",
        background: "transparent", color: "white", outline: "none",
        transition: "all 0.2s ease",
        boxShadow: isFocused ? "0 0 0 2px rgba(79,70,229,0.3)" : "none",
        boxSizing: "border-box",
    };
    return (_jsx("div", { style: containerStyle, children: _jsxs("div", { style: wrapperStyle, children: [_jsx(Search, { size: 16, style: iconStyle }), _jsx("input", { type: "Search any tool...", placeholder: "Search...", value: query, onChange: (e) => onQueryChange(e.target.value), onFocus: () => setIsFocused(true), onBlur: () => setIsFocused(false), style: inputStyle }), query && (_jsx("button", { style: clearStyle, onMouseDown: () => onQueryChange(""), children: _jsx(X, { size: 14 }) }))] }) }));
};
export default SearchBar;
