'use client';

import { useState } from 'react';
import { Handle, NodeToolbar, Position, type NodeProps } from '@xyflow/react';
import StartProfileForm from '@/components/nodes/StartProfileForm';
import { emptyStartProfile, type StartProfile } from '@/types/startProfile';

export default function StartNode({ data }: NodeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [profile, setProfile] = useState<StartProfile>(emptyStartProfile);
  const handleClick = () => {
    setShowTooltip((prev) => !prev);
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