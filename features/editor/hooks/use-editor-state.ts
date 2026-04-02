import { useEffect, useMemo, useState } from "react";

import { createDefaultMap } from "../services/defaults";
import { autoLayoutNodes, snapPointToNearestRing } from "../services/orbit-layout";
import { loadMap, saveMap } from "../services/storage";
import type { OrbitConnection, OrbitMap, OrbitNode, NodeStatus } from "../types/editor";

type UpdateNodeInput = {
  title?: string;
  description?: string;
  status?: NodeStatus;
  estimatedHours?: number;
  importance?: number;
  ringIndex?: number;
};

export function useEditorState() {
  const [map, setMap] = useState<OrbitMap>(() => createDefaultMap());
  const [hasHydrated, setHasHydrated] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [connectionSourceId, setConnectionSourceId] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadMap();

    queueMicrotask(() => {
      if (stored) {
        setMap(stored);
      }

      setHasHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    saveMap(map);
  }, [hasHydrated, map]);

  const selectedNode = useMemo(
    () => map.nodes.find((node) => node.id === selectedNodeId) ?? null,
    [map.nodes, selectedNodeId]
  );

  const setRingCount = (count: number) => {
    if (count < 1) {
      return;
    }

    setMap((state) => {
      const existing = state.rings;
      const nextRings = Array.from({ length: count }, (_, index) => {
        const existingRing = existing[index];
        if (existingRing) {
          return existingRing;
        }

        return {
          id: `ring-${index}`,
          label: `Level ${index + 1}`,
          radius: 140 * (index + 1),
        };
      });

      return {
        ...state,
        rings: nextRings,
        nodes: autoLayoutNodes(
          state.nodes.map((node) => ({
            ...node,
            ringIndex: Math.min(node.ringIndex, count - 1),
          })),
          nextRings
        ),
      };
    });
  };

  const updateNode = (nodeId: string, updates: UpdateNodeInput) => {
    setMap((state) => ({
      ...state,
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              ...updates,
            }
          : node
      ),
    }));
  };

  const moveNode = (
    nodeId: string,
    x: number,
    y: number,
    options?: { snapToOrbit?: boolean; magnetThreshold?: number }
  ) => {
    const snapToOrbit = options?.snapToOrbit ?? false;
    const magnetThreshold = options?.magnetThreshold ?? 48;

    setMap((state) => ({
      ...state,
      nodes: state.nodes.map((node) => {
        if (node.id !== nodeId) {
          return node;
        }

        if (!snapToOrbit) {
          return {
            ...node,
            x,
            y,
          };
        }

        const snapped = snapPointToNearestRing(x, y, state.rings, magnetThreshold);

        return {
          ...node,
          x: snapped.x,
          y: snapped.y,
          ringIndex: snapped.ringIndex,
        };
      }),
    }));
  };

  const addNode = () => {
    setMap((state) => {
      const ringIndex = Math.max(0, state.rings.length - 1);
      const id = `node-${Date.now()}`;
      const nextNodes: OrbitNode[] = [
        ...state.nodes,
        {
          id,
          title: "New Concept",
          description: "",
          status: "not-started",
          estimatedHours: 1,
          ringIndex,
          importance: 5,
          x: 0,
          y: 0,
        },
      ];

      return {
        ...state,
        nodes: autoLayoutNodes(nextNodes, state.rings),
      };
    });
  };

  const deleteNode = (nodeId: string) => {
    setMap((state) => ({
      ...state,
      nodes: state.nodes.filter((node) => node.id !== nodeId),
      connections: state.connections.filter(
        (connection) => connection.from !== nodeId && connection.to !== nodeId
      ),
    }));

    setSelectedNodeId((value) => (value === nodeId ? null : value));
  };

  const autoLayout = () => {
    setMap((state) => ({
      ...state,
      nodes: autoLayoutNodes(state.nodes, state.rings),
    }));
  };

  const updateRingLabel = (ringId: string, label: string) => {
    setMap((state) => ({
      ...state,
      rings: state.rings.map((ring) =>
        ring.id === ringId
          ? {
              ...ring,
              label,
            }
          : ring
      ),
    }));
  };

  const assignNodeToRing = (nodeId: string, ringIndex: number) => {
    setMap((state) => {
      const normalizedIndex = Math.min(Math.max(ringIndex, 0), state.rings.length - 1);
      const nextNodes = state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              ringIndex: normalizedIndex,
            }
          : node
      );

      return {
        ...state,
        nodes: autoLayoutNodes(nextNodes, state.rings),
      };
    });
  };

  const startConnection = () => {
    setConnectionSourceId(selectedNodeId);
  };

  const createConnectionTo = (targetNodeId: string) => {
    if (!connectionSourceId || connectionSourceId === targetNodeId) {
      setConnectionSourceId(null);
      return;
    }

    setMap((state) => {
      const exists = state.connections.some(
        (connection) =>
          connection.from === connectionSourceId && connection.to === targetNodeId
      );

      if (exists) {
        return state;
      }

      const connection: OrbitConnection = {
        id: `conn-${Date.now()}`,
        from: connectionSourceId,
        to: targetNodeId,
      };

      return {
        ...state,
        connections: [...state.connections, connection],
      };
    });

    setConnectionSourceId(null);
  };

  return {
    map,
    selectedNode,
    selectedNodeId,
    setSelectedNodeId,
    updateNode,
    moveNode,
    addNode,
    deleteNode,
    autoLayout,
    searchQuery,
    setSearchQuery,
    setRingCount,
    updateRingLabel,
    assignNodeToRing,
    connectionSourceId,
    startConnection,
    createConnectionTo,
  };
}
