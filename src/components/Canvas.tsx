'use client';

import { useCallback, useState, useEffect } from 'react';
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
import { TooltipProvider, useTooltip } from '@/contexts/TooltipContext';
import { ScenarioProvider, useScenario } from '@/contexts/ScenarioContext';
import type { ApplyScenariosPayload } from '@/contexts/ScenarioContext';
import GlimpseNode from '@/components/nodes/GlimpseNode';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { collectBranch } from '@/lib/collectBranch';
import { useProfile } from '@/contexts/ProfileContext';

const nodeTypes = {
  start: StartNode,
  event: EventNode,
  action: ActionNode,
  glimpse: GlimpseNode,
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
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [activeTool, setActiveTool] = useState<Tool>(null);
  const { screenToFlowPosition, fitView, getNodes, getEdges } = useReactFlow();
  const { closeTooltip } = useTooltip();
  const { registerApplyScenarios } = useScenario();
  const { profile } = useProfile();
  const { generateFromBranch } = useScenario();

  useEffect(() => {
    registerApplyScenarios((data: ApplyScenariosPayload) => {
      const { scenarios, anchorNodeId, glimpseNodeId } = data;
  
      setNodes((currentNodes) => {
        const anchor = currentNodes.find((n) => n.id === anchorNodeId);
        const glimpse = currentNodes.find((n) => n.id === glimpseNodeId);
        if (!anchor) return currentNodes;
  
        const baseX = anchor.position.x + 180;
        const baseY = anchor.position.y;
  
        const keptNodes = currentNodes.filter((n) => n.id !== glimpseNodeId);
        const generatedNodes: Node[] = [];
  
        scenarios.forEach((scenario, scenarioIndex) => {
          const prefix = `${anchorNodeId}-s${scenarioIndex}`;
          const offsetY =
            baseY + scenarioIndex * 200 - ((scenarios.length - 1) * 100);
  
          scenario.nodes.forEach((n, index) => {
            generatedNodes.push({
              id: `${prefix}-${n.id}`,
              type: n.type,
              position: { x: baseX + index * 180, y: offsetY },
              data: { text: n.text, scenarioTitle: scenario.title },
              className: n.type === 'event' ? 'event-node' : 'action-node',
            });
          });
        });
        console.log('nodes before:', currentNodes.length);
        console.log('kept:', keptNodes.length);
        console.log('generated:', generatedNodes.length); 
        return [...keptNodes, ...generatedNodes];
      });
  
      setEdges((currentEdges) => {
        const withoutGlimpse = currentEdges.filter(
          (e) => e.source !== glimpseNodeId && e.target !== glimpseNodeId,
        );
  
        const newEdges: Edge[] = [];
  
        scenarios.forEach((scenario, scenarioIndex) => {
          const prefix = `${anchorNodeId}-s${scenarioIndex}`;
  
          scenario.edges.forEach((e, i) => {
            newEdges.push({
              id: `${prefix}-e${i}`,
              source:
                e.source === 'anchor'
                  ? anchorNodeId
                  : `${prefix}-${e.source}`,
              target: `${prefix}-${e.target}`,
            });
          });
        });
  
        return [...withoutGlimpse, ...newEdges];
      });
  
      setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
    });
  }, [registerApplyScenarios, setNodes, setEdges, fitView]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
  
      const currentNodes = getNodes();
      const nextEdges = addEdge(connection, getEdges());
  
      setEdges(nextEdges);
  
      const targetNode = currentNodes.find((n) => n.id === connection.target);
      if (targetNode?.type !== 'glimpse') return;
  
      const branch = collectBranch(connection.source, currentNodes, nextEdges);
  
      if (!branch.some((n) => n.type === 'start')) {
        console.error('Branch must start from start node');
        return;
      }
  
      generateFromBranch({
        profile,
        branch,
        anchorNodeId: connection.source,
        glimpseNodeId: connection.target,
      });
    },
    [profile, generateFromBranch, getNodes, getEdges],
  );

  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      closeTooltip();
      if (!activeTool || activeTool === 'remove') return;
      
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      if (activeTool === 'glimpse') {
        setNodes((nds) => [
          ...nds,
          {
            id: crypto.randomUUID(),
            type: 'glimpse',
            position,
            data: {},
            className: 'glimpse-node',
          },
        ]);
        return;
      }

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
    [activeTool, setNodes, screenToFlowPosition, closeTooltip],
  );

    const isValidConnection = useCallback(
        (connection: Connection | Edge) => {
            if (connection.source === connection.target) return false;
            const sourceNode = nodes.find((n) => n.id === connection.source);
            const targetNode = nodes.find((n) => n.id === connection.target);
            if (targetNode?.type === 'glimpse') {
                return sourceNode?.type === 'event' || sourceNode?.type === 'action';
            }
            if (sourceNode?.type === 'glimpse') return false;
            return true;
        },
        [nodes],
    );

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
            <ProfileProvider>
                <ScenarioProvider>
                    <TooltipProvider>
                        <CanvasInner />
                    </TooltipProvider>
                </ScenarioProvider>
            </ProfileProvider>
        </ReactFlowProvider>
    );
}
