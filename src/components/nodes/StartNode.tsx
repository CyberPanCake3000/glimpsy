'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';

export default function StartNode({ data }: NodeProps) {
  return (
    <div className="start-node">
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