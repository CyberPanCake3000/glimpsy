'use client';

import { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import StartNode from '@/components/nodes/StartNode';

const nodeTypes = {
    start: StartNode,
};

const initialNodes: Node[] = [
    {
        id: 'start',
        type: 'start',
        position: { x: 0, y: 0 },
        data: { label: 'start' },
        className: 'start-node',
    },
];

const initialEdges: Edge[] = [];

export default function Canvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  return (
    <ReactFlow
      nodeTypes={nodeTypes}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
    >
      <Background gap={20} size={1} color="var(--text-muted)" />
      <Controls />
      {/* <MiniMap
        nodeColor="var(--primary-accent)"
        maskColor="rgba(10, 8, 16, 0.8)"
      /> */}
    </ReactFlow>
  );
}