'use client';

import { Handle, Position, type NodeProps, NodeToolbar } from '@xyflow/react';
import EventForm from '@/components/nodes/EventForm';
import { useState } from 'react';

export default function EventNode(_props: NodeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [eventText, setEventText] = useState('');

  const handleClick = () => {
    setShowTooltip((prev) => !prev);
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
      <div className="event-node__shape" />
    </div>
  );
}