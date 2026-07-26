'use client';

import { useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Panel,
  ReactFlowProvider,
  useReactFlow,
  useNodesState,
  useEdgesState,
  type Node,
  addEdge,
  type Connection,
  type Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import StartNode from '@/components/nodes/StartNode';
import EventNode from '@/components/nodes/EventNode';
import ActionNode from '@/components/nodes/ActionNode';
import Toolbar, { type Tool } from '@/components/Toolbar';

const nodeTypes = {
  start: StartNode,
  event: EventNode,
  action: ActionNode,
};

const initialNodes: Node[] = [
  {
    id: 'start',
    type: 'start',
    position: { x: 0, y: 0 },
    data: { label: 'start' },
    className: 'start-node',
    draggable: false,
  },
];

function CanvasInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [activeTool, setActiveTool] = useState<Tool>(null);
  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (!activeTool || activeTool === 'remove') return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      setNodes((nds) => [
        ...nds,
        {
          id: crypto.randomUUID(),
          type: activeTool,
          position,
          data: {},
          className: activeTool === 'event' ? 'event-node' : 'action-node',
        },
      ]);
    },
    [activeTool, setNodes, screenToFlowPosition],
  );

  const isValidConnection = (connection: Connection) =>
    connection.source !== connection.target;

  const clearExceptStart = useCallback(() => {
    setNodes((nds) => nds.filter((node) => node.type === 'start'));
    setEdges([]);
  }, [setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (activeTool !== 'remove') return;
      if (node.type === 'start') return;
  
      setNodes((nds) => nds.filter((n) => n.id !== node.id));
      setEdges((eds) =>
        eds.filter((e: Edge) => e.source !== node.id && e.target !== node.id),
      );
    },
    [activeTool, setNodes, setEdges],
  );

  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      if (activeTool !== 'remove') return;
  
      setEdges((eds) => eds.filter((e: Edge) => e.id !== edge.id));
    },
    [activeTool, setEdges],
  );

  return (
    <ReactFlow
      isValidConnection={isValidConnection}
      nodeOrigin={[0.5, 0.5]}
      nodeTypes={nodeTypes}
      nodes={nodes}
      onNodesChange={onNodesChange}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      onEdgeClick={onEdgeClick}
      fitView
      className={
        activeTool === 'event' || activeTool === 'action'
          ? 'canvas--drawing'
          : activeTool === 'remove'
            ? 'canvas--removing'
            : undefined
      }
      edges={edges}
      onConnect={onConnect}
      onEdgesChange={onEdgesChange}
      defaultEdgeOptions={{
      style: { stroke: 'var(--primary-accent)', strokeWidth: 2 }, interactionWidth: 20,
  }}
  connectionLineStyle={{ stroke: 'var(--primary-accent)', strokeWidth: 2 }}
    >
      <Background gap={20} size={1} color="var(--text-muted)" />
      <Controls />

      <Panel position="top-left">
        <Toolbar activeTool={activeTool} onSelect={setActiveTool} />
      </Panel>
    </ReactFlow>
  );
}

export default function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}