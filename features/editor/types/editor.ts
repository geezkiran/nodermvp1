export type NodeStatus = "not-started" | "in-progress" | "done";

export type OrbitNode = {
  id: string;
  title: string;
  description: string;
  status: NodeStatus;
  estimatedHours: number;
  ringIndex: number;
  importance: number;
  x: number;
  y: number;
};

export type OrbitConnection = {
  id: string;
  from: string;
  to: string;
};

export type OrbitRing = {
  id: string;
  label: string;
  radius: number;
};

export type OrbitMap = {
  id: string;
  name: string;
  rings: OrbitRing[];
  nodes: OrbitNode[];
  connections: OrbitConnection[];
};

export type ViewportState = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

export type ZoomBand = "far" | "base" | "near" | "ultra";
