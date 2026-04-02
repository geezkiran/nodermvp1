import type { OrbitNode, OrbitRing, ZoomBand } from "../types/editor";

const TAU = Math.PI * 2;

export function autoLayoutNodes(nodes: OrbitNode[], rings: OrbitRing[]): OrbitNode[] {
  const byRing = new Map<number, OrbitNode[]>();

  for (const node of nodes) {
    const list = byRing.get(node.ringIndex) ?? [];
    list.push(node);
    byRing.set(node.ringIndex, list);
  }

  const next: OrbitNode[] = [];

  for (const [ringIndex, ringNodes] of byRing) {
    const ring = rings[ringIndex];
    if (!ring) {
      next.push(...ringNodes);
      continue;
    }

    const sorted = [...ringNodes].sort((a, b) => b.importance - a.importance);
    const weights = sorted.map((node) => Math.max(1, node.importance));
    const total = weights.reduce((sum, value) => sum + value, 0);

    let cursor = 0;
    for (let i = 0; i < sorted.length; i += 1) {
      const weight = weights[i] ?? 1;
      const arc = (weight / total) * TAU;
      const angle = cursor + arc / 2;
      cursor += arc;

      next.push({
        ...sorted[i],
        x: Math.cos(angle) * ring.radius,
        y: Math.sin(angle) * ring.radius,
      });
    }
  }

  return next;
}

export function getRingCompletion(ringIndex: number, nodes: OrbitNode[]): number {
  const ringNodes = nodes.filter((node) => node.ringIndex === ringIndex);
  if (ringNodes.length === 0) {
    return 0;
  }

  const doneCount = ringNodes.filter((node) => node.status === "done").length;
  return Math.round((doneCount / ringNodes.length) * 100);
}

export function snapPointToNearestRing(
  x: number,
  y: number,
  rings: OrbitRing[],
  threshold = 48
) {
  if (rings.length === 0) {
    return { x, y, ringIndex: 0, snapped: false };
  }

  const distance = Math.hypot(x, y);
  const angle = Math.atan2(y, x);

  let nearestIndex = 0;
  let nearestDelta = Number.POSITIVE_INFINITY;

  for (let index = 0; index < rings.length; index += 1) {
    const delta = Math.abs(distance - rings[index].radius);
    if (delta < nearestDelta) {
      nearestDelta = delta;
      nearestIndex = index;
    }
  }

  const nearestRing = rings[nearestIndex];
  const shouldSnap = nearestDelta <= threshold;

  if (!shouldSnap) {
    return { x, y, ringIndex: nearestIndex, snapped: false };
  }

  return {
    x: Math.cos(angle) * nearestRing.radius,
    y: Math.sin(angle) * nearestRing.radius,
    ringIndex: nearestIndex,
    snapped: true,
  };
}

export type ZoomVisualConfig = {
  majorGrid: number;
  minorGrid: number;
  nodeMinWidth: number;
  nodePaddingX: number;
  nodePaddingY: number;
  nodeTitleSize: number;
  nodeMetaSize: number;
  ringLabelSize: number;
};

export function getZoomVisualConfig(scale: number, band: ZoomBand): ZoomVisualConfig {
  if (band === "far") {
    return {
      majorGrid: 92,
      minorGrid: 24,
      nodeMinWidth: 162,
      nodePaddingX: 14,
      nodePaddingY: 10,
      nodeTitleSize: 12,
      nodeMetaSize: 10,
      ringLabelSize: 12,
    };
  }

  if (band === "near") {
    return {
      majorGrid: 56,
      minorGrid: 14,
      nodeMinWidth: 124,
      nodePaddingX: 10,
      nodePaddingY: 7,
      nodeTitleSize: 11,
      nodeMetaSize: 9,
      ringLabelSize: 10,
    };
  }

  if (band === "ultra") {
    const compression = Math.min(1, Math.max(0, (scale - 2.4) / 4));
    return {
      majorGrid: 42 - compression * 8,
      minorGrid: 10 - compression * 2,
      nodeMinWidth: 108 - compression * 10,
      nodePaddingX: 8 - compression,
      nodePaddingY: 6 - compression * 0.5,
      nodeTitleSize: 10,
      nodeMetaSize: 9,
      ringLabelSize: 9,
    };
  }

  return {
    majorGrid: 72,
    minorGrid: 18,
    nodeMinWidth: 138,
    nodePaddingX: 12,
    nodePaddingY: 8,
    nodeTitleSize: 12,
    nodeMetaSize: 10,
    ringLabelSize: 11,
  };
}
