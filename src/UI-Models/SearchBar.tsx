import React, { ChangeEvent, CSSProperties } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ query, onQueryChange }) => {
  const [isFocused, setIsFocused] = React.useState(false);

  const containerStyle: CSSProperties = { padding: "20px", backgroundColor: "#111" };
  const wrapperStyle: CSSProperties = { position: "relative", width: "300px" };
  const iconStyle: CSSProperties = {
    position: "absolute", top: "50%", left: "12px",
    transform: "translateY(-50%)", color: "gray", pointerEvents: "none",
  };
  const clearStyle: CSSProperties = {
    position: "absolute", top: "50%", right: "10px",
    transform: "translateY(-50%)", color: "gray",
    cursor: "pointer", background: "none", border: "none", padding: 0,
    display: "flex", alignItems: "center",
  };
  const inputStyle: CSSProperties = {
    width: "100%",
    padding: `10px ${query ? "32px" : "12px"} 10px 36px`,
    borderRadius: "14px",
    border: isFocused ? "1px solid #3B9D55" : "1px solid #323232",
    background: "transparent", color: "white", outline: "none",
    transition: "all 0.2s ease",
    boxShadow: isFocused ? "0 0 0 2px rgba(79,70,229,0.3)" : "none",
    boxSizing: "border-box",
  };

  return (
    <div style={containerStyle}>
      <div style={wrapperStyle}>
        <Search size={16} style={iconStyle} />
        <input
          type="Search any tool..."
          placeholder="Search..."
          value={query}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onQueryChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={inputStyle}
        />
        {query && (
          <button style={clearStyle} onMouseDown={() => onQueryChange("")}>
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;