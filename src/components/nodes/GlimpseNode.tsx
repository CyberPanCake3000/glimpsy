'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useScenario } from '@/contexts/ScenarioContext';

export default function GlimpseNode({ id, data }: NodeProps) {
  const { isGenerating } = useScenario();
  const isThisGenerating = isGenerating || data.status === 'generating';

  return (
    <div className="glimpse-node">
      <Handle type="target" position={Position.Left} className="node-handle" />

      <div
        className={`glimpse-node__shape${isThisGenerating ? ' glimpse-node__shape--loading' : ''}`}
        aria-label="glimpse"
      >
        {isThisGenerating ? (
          <span className="node-shape__loading">…</span>
        ) : (
          <i className="bi bi-stars glimpse-node__icon" aria-hidden />
        )}
      </div>
    </div>
  );
}