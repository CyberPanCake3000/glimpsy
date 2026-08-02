'use client';

import { Handle, NodeToolbar, Position, type NodeProps } from '@xyflow/react';
import { useState } from 'react';
import { useTooltip } from '@/contexts/TooltipContext';
import { useEmojiFromText } from '@/hooks/useEmojiFromText';
import GoalForm from './GoalForm';
import { useReactFlow } from '@xyflow/react';

export default function GoalNode({ id, data }: NodeProps) {
  const { activeNodeId, hoveredNodeId, setHoveredNodeId, scheduleHoverClose, cancelHoverClose, toggleTooltip } = useTooltip();
  const showToolbar = activeNodeId === id || hoveredNodeId === id;
  const [goalText, setGoalText] = useState((data.text as string) ?? '');
  const { emoji, loading } = useEmojiFromText(goalText, 'action');
  const { updateNodeData } = useReactFlow();

  const handleClick = () => {
    toggleTooltip(id);
  };

  const handleFormClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  const handleChange = (value: string) => {
    setGoalText(value);
    updateNodeData(id, { text: value });
  };

  return (
    <div
      className="goal-node"
      onClick={handleClick}
      onMouseEnter={() => {
        cancelHoverClose();
        setHoveredNodeId(id);
      }}
      onMouseLeave={() => scheduleHoverClose(id)}
    >
      <NodeToolbar isVisible={showToolbar} position={Position.Left} offset={16}>
      <div
        onMouseEnter={cancelHoverClose}
        onMouseLeave={() => {
          if (activeNodeId !== id) scheduleHoverClose(id);
        }}
      >
        <GoalForm value={goalText} onChange={handleChange} onClick={handleFormClick} />
      </div>
      </NodeToolbar>

      <Handle type="target" position={Position.Left} className="node-handle" />

      <div className="goal-node__shape">
        {loading ? (
          <span className="node-shape__loading">…</span>
        ) : emoji ? (
          <span className="goal-node__emoji">{emoji}</span>
        ) : null}
      </div>
    </div>
  );
}