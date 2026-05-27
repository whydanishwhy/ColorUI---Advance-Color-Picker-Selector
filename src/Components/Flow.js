import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback } from "react";
import ReactFlow, { addEdge, useNodesState, useEdgesState, } from "reactflow";
import "reactflow/dist/style.css";
const initialNodes = [
    {
        id: "1",
        position: { x: 0, y: 0 },
        data: { label: "Start" },
        type: "input",
    },
    {
        id: "2",
        position: { x: 200, y: 100 },
        data: { label: "Process" },
    },
];
const initialEdges = [
    {
        id: "e1-2",
        source: "1",
        target: "2",
    },
];
export default function Flow() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const onConnect = useCallback((connection) => setEdges((eds) => addEdge(connection, eds)), []);
    return (_jsx("div", { style: { width: "100%", height: "100vh" }, children: _jsx(ReactFlow, { nodes: nodes, edges: edges, onNodesChange: onNodesChange, onEdgesChange: onEdgesChange, onConnect: onConnect, fitView: true }) }));
}
