'use client';

import { Handle, NodeToolbar, Position, type NodeProps } from '@xyflow/react';
import StartProfileForm from '@/components/nodes/StartProfileForm';
import { useTooltip } from '@/contexts/TooltipContext';
import { useProfile } from '@/contexts/ProfileContext';

export default function StartNode({ id, data }: NodeProps) {
  const { activeNodeId, toggleTooltip } = useTooltip();
  const showTooltip = activeNodeId === id;
  const { profile, setProfile } = useProfile();
  const handleClick = () => {
    toggleTooltip(id);
  };

  const handleFormClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <div className="start-node" onClick={handleClick}>
      <NodeToolbar isVisible={showTooltip} position={Position.Left} offset={16}>
      <StartProfileForm
        profile={profile}
        onChange={setProfile}
        onClick={handleFormClick}
      />
      </NodeToolbar>

      <span className="start-node__label">{data.label as string}</span>
      <div className="start-node__dot">
        <Handle
          type="source"
          position={Position.Right}
          className="start-node__handle"
        />
      </div>
    </div>
  );
}