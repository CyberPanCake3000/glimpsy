'use client';

import { Handle, Position, type NodeProps, NodeToolbar } from '@xyflow/react';
import EventForm from '@/components/nodes/EventForm';
import { useState } from 'react';
import { useTooltip } from '@/contexts/TooltipContext';
import { useEmojiFromText } from '@/hooks/useEmojiFromText';

export default function EventNode({ id, data }: NodeProps) {
  const { activeNodeId, toggleTooltip } = useTooltip();
  const showTooltip = activeNodeId === id;
  const [eventText, setEventText] = useState((data.text as string) ?? '');
  const { emoji, loading } = useEmojiFromText(eventText, 'event');

  const handleClick = () => {
    toggleTooltip(id);
  };

  const handleFormClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };
  return (
    <div className="event-node" onClick={handleClick}>
      <NodeToolbar isVisible={showTooltip} position={Position.Left} offset={16}>
        <EventForm
          value={eventText}
          onChange={setEventText}
          onClick={handleFormClick}
        />
      </NodeToolbar>

      <Handle type="target" position={Position.Left} className="node-handle" />
      <Handle type="source" position={Position.Right} className="node-handle" />
      <div className="event-node__shape">
        {loading ? (
          <span className="node-shape__loading">…</span>
              ) : emoji ? (
                  <span className="node-shape__emoji">{emoji}</span>
              ) : null}
      </div>
    </div>
  );
}