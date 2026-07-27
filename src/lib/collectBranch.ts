import type { Node, Edge } from '@xyflow/react';

export type BranchNode = {
  id: string;
  type: 'start' | 'event' | 'action';
  text: string;
};

export function collectBranch(
  leafNodeId: string,
  nodes: Node[],
  edges: Edge[],
): BranchNode[] {
  const path: BranchNode[] = [];
  let currentId: string | null = leafNodeId;

  while (currentId) {
    const node = nodes.find((n) => n.id === currentId);
    if (!node) break;

    path.unshift({
      id: node.id,
      type: node.type as BranchNode['type'],
      text:
        node.type === 'start'
          ? 'start'
          : ((node.data?.text as string) ?? ''),
    });

    if (node.type === 'start') break;

    const incoming = edges.find((e) => e.target === currentId);
    currentId = incoming?.source ?? null;
  }

  return path;
}