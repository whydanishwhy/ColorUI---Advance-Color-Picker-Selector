import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo } from "react";
import { Handle, Position } from "reactflow";
function CustomNode({ id, data }) {
    return (_jsxs("div", { style: {
            padding: 12,
            width: 200,
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: 8,
        }, children: [_jsx(Handle, { type: "target", position: Position.Top }), _jsx(Handle, { type: "source", position: Position.Bottom }), _jsx("strong", { children: data.label }), _jsxs("div", { style: { marginTop: 8 }, children: [_jsxs("label", { children: ["Value: ", data.value] }), _jsx("input", { type: "range", min: 0, max: 100, value: data.value, onMouseDown: (e) => e.stopPropagation(), onChange: (e) => data.onChange(id, { value: Number(e.target.value) }) })] })] }));
}
export default memo(CustomNode);
