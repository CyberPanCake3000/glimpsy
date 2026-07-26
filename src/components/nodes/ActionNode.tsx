'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';

export default function ActionNode(_props: NodeProps) {
  return (
    <>
      <Handle type="target" position={Position.Left} className="node-handle" />
      <Handle type="source" position={Position.Right} className="node-handle" />
      <div className="action-node__shape" />
    </>
  );
}