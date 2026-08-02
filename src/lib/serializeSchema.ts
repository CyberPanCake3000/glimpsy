import type { Edge, Node } from '@xyflow/react';
import type { StartProfile } from '@/types/startProfile';
import type { SharedSchema } from '@/types/sharedSchema';

export function isSchemaEmpty(schema: SharedSchema): boolean {
    return !schema.nodes.some((n) => n.type !== 'start');
}

export function buildSharedSchema(
  nodes: Node[],
  edges: Edge[],
  profile: StartProfile,
): SharedSchema {
  return {
    version: 1,
    profile,
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.type ?? 'default',
      position: n.position,
      data: n.data ?? {},
      className: n.className,
      draggable: n.draggable,
    })),
    edges: edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
    })),
  };
}

export function downloadJson(schema: SharedSchema, filename = 'glimpsy-schema.json') {
  const blob = new Blob([JSON.stringify(schema, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}