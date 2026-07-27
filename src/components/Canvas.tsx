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
import GoalNode from '@/components/nodes/GoalNode';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { collectBranch } from '@/lib/collectBranch';
import { useProfile } from '@/contexts/ProfileContext';
import { getGlimpseBridge } from '@/lib/glimpseBridge';

const nodeTypes = {
  start: StartNode,
  event: EventNode,
  action: ActionNode,
  glimpse: GlimpseNode,
  goal: GoalNode,
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
      const { scenarios, startNodeId, goalNodeId, glimpseNodeId } = data;
      const scenario = scenarios[0];
      if (!scenario) return;
  
      setNodes((currentNodes) => {
        const startNode = currentNodes.find((n) => n.id === startNodeId);
        const goalNode = currentNodes.find((n) => n.id === goalNodeId);
        if (!startNode || !goalNode) return currentNodes;
  
        const keptNodes = currentNodes.filter((n) => n.id !== glimpseNodeId);
        const prefix = `${startNodeId}-bridge`;
        const nodeCount = scenario.nodes.length;
        const gap = goalNode.position.x - startNode.position.x;
        const step = gap / (nodeCount + 1);
  
        const generatedNodes: Node[] = scenario.nodes.map((n, index) => ({
          id: `${prefix}-${n.id}`,
          type: n.type,
          position: {
            x: startNode.position.x + step * (index + 1),
            y: startNode.position.y,
          },
          data: { text: n.text },
          className: n.type === 'event' ? 'event-node' : 'action-node',
        }));
  
        return [...keptNodes, ...generatedNodes];
      });
  
      setEdges((currentEdges) => {
        const withoutGlimpse = currentEdges.filter(
          (e) => e.source !== glimpseNodeId && e.target !== glimpseNodeId,
        );
  
        const prefix = `${startNodeId}-bridge`;
        const newEdges: Edge[] = scenario.edges.map((e, i) => ({
          id: `${prefix}-e${i}`,
          source:
            e.source === 'start'
              ? startNodeId
              : `${prefix}-${e.source}`,
          target:
            e.target === 'goal'
              ? goalNodeId
              : `${prefix}-${e.target}`,
        }));
  
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

      const glimpseId =
        currentNodes.find((n) => n.id === connection.target)?.type === 'glimpse'
          ? connection.target
          : currentNodes.find((n) => n.id === connection.source)?.type === 'glimpse'
            ? connection.source
            : null;
      if (!glimpseId) return;
      const bridge = getGlimpseBridge(glimpseId, currentNodes, nextEdges);
      if (!bridge) return; // второй конец ещё не подключён
      const branch = collectBranch(bridge.startNodeId, currentNodes, nextEdges);
      if (!branch.some((n) => n.type === 'start')) {
        console.error('Branch must start from start node');
        return;
      }
      generateFromBranch({
        profile,
        branch,
        startNodeId: bridge.startNodeId,
        goalNodeId: bridge.goalNodeId,
        goalText: bridge.goalText,
        glimpseNodeId: bridge.glimpseNodeId,
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

      if (activeTool === 'goal') {
        setNodes((nds) => [
          ...nds,
          {
            id: crypto.randomUUID(),
            type: 'goal',
            position,
            data: {},
            className: 'goal-node',
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
            if (sourceNode?.type === 'glimpse') {
                return targetNode?.type === 'goal';
            }
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
              activeTool === 'event' ||
                  activeTool === 'action' ||
                  activeTool === 'goal' ||
                  activeTool === 'glimpse'
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
