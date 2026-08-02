'use client';

import { useCallback, useState } from 'react';
import { Handle, NodeToolbar, Position, type NodeProps, useReactFlow } from '@xyflow/react';
import ActionForm from '@/components/nodes/ActionForm';
import { useTooltip } from '@/contexts/TooltipContext';
import { useEmojiFromText } from '@/hooks/useEmojiFromText';

export default function ActionNode({ id, data }: NodeProps) {
  const { activeNodeId, hoveredNodeId, setHoveredNodeId, scheduleHoverClose, cancelHoverClose, toggleTooltip } = useTooltip();
  const showToolbar = activeNodeId === id || hoveredNodeId === id;
  const [actionText, setActionText] = useState((data.text as string) ?? '');
  const { updateNodeData } = useReactFlow();

  const persistEmoji = useCallback(
    (emoji: string | null) => {
      updateNodeData(id, { emoji: emoji ?? undefined });
    },
    [id, updateNodeData],
  );

  const handleChange = (value: string) => {
    setActionText(value);
    updateNodeData(id, { text: value, emoji: undefined });
  };

  const { emoji, loading } = useEmojiFromText(actionText, 'action', {
    cachedEmoji: (data.emoji as string) ?? null,
    onEmojiChange: persistEmoji,
  });

  const handleClick = () => {
    toggleTooltip(id);
  };

  const handleFormClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <div
    className="action-node"
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
        <ActionForm
          value={actionText}
          onChange={handleChange}
          onClick={handleFormClick}
        />
      </div>
      </NodeToolbar>

      <Handle type="target" position={Position.Left} className="node-handle" />
      <Handle type="source" position={Position.Right} className="node-handle" />
          <div className="action-node__shape">
              {loading ? (
                  <span className="node-shape__loading">…</span>
              ) : emoji ? (
                  <span className="node-shape__emoji">{emoji}</span>
              ) : null}
          </div>
    </div>
  );
}