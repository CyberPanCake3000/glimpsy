'use client';

import { useState } from 'react';
import { Handle, NodeToolbar, Position, type NodeProps } from '@xyflow/react';
import ActionForm from '@/components/nodes/ActionForm';
import { useTooltip } from '@/contexts/TooltipContext';

export default function ActionNode({ id }: NodeProps) {
  const { activeNodeId, toggleTooltip } = useTooltip();
  const showTooltip = activeNodeId === id;
  const [actionText, setActionText] = useState('');

  const handleClick = () => {
    toggleTooltip(id);
  };

  const handleFormClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <div className="action-node" onClick={handleClick}>
      <NodeToolbar isVisible={showTooltip} position={Position.Left} offset={16}>
        <ActionForm
          value={actionText}
          onChange={setActionText}
          onClick={handleFormClick}
        />
      </NodeToolbar>

      <Handle type="target" position={Position.Left} className="node-handle" />
      <Handle type="source" position={Position.Right} className="node-handle" />
      <div className="action-node__shape" />
    </div>
  );
}