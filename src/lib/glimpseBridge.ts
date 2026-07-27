import type { Node, Edge } from '@xyflow/react';

export type GlimpseBridge = {
    glimpseNodeId: string;
    startNodeId: string;
    goalNodeId: string;
    goalText: string;
};

export function getGlimpseBridge(
    glimpseNodeId: string,
    nodes: Node[],
    edges: Edge[],
): GlimpseBridge | null {
    const incoming = edges.find((e) => e.target === glimpseNodeId);
    const outgoing = edges.find((e) => e.source === glimpseNodeId);
    if (!incoming || !outgoing) return null;

    const startNode = nodes.find((n) => n.id === incoming.source);
    const goalNode = nodes.find((n) => n.id === outgoing.target);

    if (!startNode || !goalNode) return null;
    if (startNode.type !== 'event' && startNode.type !== 'action') return null;
    if (goalNode.type !== 'goal') return null;

    const goalText = (goalNode.data?.text as string)?.trim();
    if (!goalText) return null;

    return {
        glimpseNodeId,
        startNodeId: startNode.id,
        goalNodeId: goalNode.id,
        goalText,
    };
}