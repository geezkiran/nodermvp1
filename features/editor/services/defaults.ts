import type { OrbitMap } from "../types/editor";
import { autoLayoutNodes } from "./orbit-layout";

const BASE_RING_STEP = 140;

export function createDefaultMap(): OrbitMap {
  const map: OrbitMap = {
    id: "default-map",
    name: "Learning Orbit",
    rings: [
      { id: "ring-0", label: "Core", radius: BASE_RING_STEP },
      { id: "ring-1", label: "Bridge", radius: BASE_RING_STEP * 2 },
      { id: "ring-2", label: "Niche", radius: BASE_RING_STEP * 3 },
    ],
    nodes: [
      {
        id: "node-core",
        title: "JavaScript Fundamentals",
        description: "Language basics and runtime model",
        status: "in-progress",
        estimatedHours: 20,
        ringIndex: 0,
        importance: 10,
        x: 0,
        y: 0,
      },
      {
        id: "node-bridge-1",
        title: "React",
        description: "Component model and state",
        status: "not-started",
        estimatedHours: 18,
        ringIndex: 1,
        importance: 8,
        x: 0,
        y: 0,
      },
      {
        id: "node-bridge-2",
        title: "TypeScript",
        description: "Type-safe tooling for JS",
        status: "not-started",
        estimatedHours: 14,
        ringIndex: 1,
        importance: 7,
        x: 0,
        y: 0,
      },
      {
        id: "node-niche-1",
        title: "Next.js App Router",
        description: "Server components and routing",
        status: "not-started",
        estimatedHours: 16,
        ringIndex: 2,
        importance: 7,
        x: 0,
        y: 0,
      },
      {
        id: "node-niche-2",
        title: "Motion Design",
        description: "Interaction and animation patterns",
        status: "not-started",
        estimatedHours: 10,
        ringIndex: 2,
        importance: 4,
        x: 0,
        y: 0,
      },
    ],
    connections: [
      { id: "c-1", from: "node-core", to: "node-bridge-1" },
      { id: "c-2", from: "node-core", to: "node-bridge-2" },
      { id: "c-3", from: "node-bridge-1", to: "node-niche-1" },
      { id: "c-4", from: "node-bridge-1", to: "node-niche-2" },
    ],
  };

  return {
    ...map,
    nodes: autoLayoutNodes(map.nodes, map.rings),
  };
}
