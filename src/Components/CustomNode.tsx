import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";

export type CustomNodeData = {
  label: string;
  value: number;
  text: string;
  onChange: (id: string, data: Partial<CustomNodeData>) => void;
};

function CustomNode({ id, data }: NodeProps<CustomNodeData>) {
  return (
    <div
      style={{
        padding: 12,
        width: 200,
        background: "#fff",
        border: "1px solid #ccc",
        borderRadius: 8,
      }}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      <strong>{data.label}</strong>

    

      {/* Slider */}
      <div style={{ marginTop: 8 }}>
        <label>Value: {data.value}</label>
        <input
          type="range"
          min={0}
          max={100}
          value={data.value}
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) =>
            data.onChange(id, { value: Number(e.target.value) })
          }
        />
      </div>
    </div>
  );
}

export default memo(CustomNode);
