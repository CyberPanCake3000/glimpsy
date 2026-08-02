import type { StartProfile } from '@/types/startProfile';

export type SharedSchemaNode = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
  className?: string;
  draggable?: boolean;
};

export type SharedSchemaEdge = {
  id: string;
  source: string;
  target: string;
};

export type SharedSchema = {
  version: 1;
  profile: StartProfile;
  nodes: SharedSchemaNode[];
  edges: SharedSchemaEdge[];
};