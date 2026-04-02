"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Link2,
  LocateFixed,
  PanelLeft,
  PanelRight,
  Plus,
  Grid2x2Check,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import Dock from "@/components/ui/dock";
import { useEditorState } from "../hooks/use-editor-state";
import { usePanZoom } from "../hooks/use-pan-zoom";
import { getRingCompletion, getZoomVisualConfig } from "../services/orbit-layout";
import type { OrbitConnection, OrbitNode } from "../types/editor";
import { NodeInspector } from "./node-inspector";

type Point = {
  x: number;
  y: number;
};

function toWorldPoint(point: Point, center: Point, scale: number, offset: Point): Point {
  return {
    x: (point.x - center.x - offset.x) / scale,
    y: (point.y - center.y - offset.y) / scale,
  };
}

function getOrbitColor(index: number, totalRings: number) {
  if (totalRings <= 1) {
    return {
      stroke: "hsla(210, 40%, 62%, 0.2)",
      label: "hsla(210, 40%, 72%, 0.38)",
    };
  }

  const ratio = index / (totalRings - 1);
  const hue = 210 - (210 - 145) * ratio;

  return {
    stroke: `hsla(${hue}, 40%, 62%, 0.2)`,
    label: `hsla(${hue}, 40%, 72%, 0.38)`,
  };
}

export function EditorCanvas() {
  const minInspectorWidth = 280;
  const maxInspectorWidth = 560;
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{
    nodeId: string | null;
    panStart: Point | null;
  }>({ nodeId: null, panStart: null });
  const [canvasSize, setCanvasSize] = useState({ width: 1080, height: 840 });

  const {
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
    assignNodeToRing,
    connectionSourceId,
    startConnection,
    createConnectionTo,
  } = useEditorState();

  const { viewport, zoomBand, panBy, zoomBy, resetView } = usePanZoom();
  const [isPanning, setIsPanning] = useState(false);
  const [inspectorCollapsed, setInspectorCollapsed] = useState(false);
  const [inspectorWidth, setInspectorWidth] = useState(320);

  const zoomVisual = useMemo(
    () => getZoomVisualConfig(viewport.scale, zoomBand),
    [viewport.scale, zoomBand]
  );
  const inverseScale = 1 / viewport.scale;
  const showGrid = viewport.scale > 0.1201;

  useEffect(() => {
    const element = canvasRef.current;
    if (!element) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      setCanvasSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const center = useMemo<Point>(
    () => ({ x: canvasSize.width / 2, y: canvasSize.height / 2 }),
    [canvasSize.height, canvasSize.width]
  );

  const query = searchQuery.trim().toLowerCase();

  const visibleConnections = useMemo(() => {
    if (query) {
      const matched = new Set(
        map.nodes
          .filter((node) => node.title.toLowerCase().includes(query))
          .map((node) => node.id)
      );

      return map.connections.filter(
        (connection) => matched.has(connection.from) || matched.has(connection.to)
      );
    }

    if (selectedNodeId) {
      const visited = new Set<string>([selectedNodeId]);
      const visible = new Set<string>();
      let advanced = true;

      while (advanced) {
        advanced = false;
        for (const connection of map.connections) {
          if (visited.has(connection.to) && !visited.has(connection.from)) {
            visited.add(connection.from);
            visible.add(connection.id);
            advanced = true;
          }
          if (visited.has(connection.from) && visited.has(connection.to)) {
            visible.add(connection.id);
          }
        }
      }

      return map.connections.filter((connection) => visible.has(connection.id));
    }

    return [] as OrbitConnection[];
  }, [map.connections, map.nodes, query, selectedNodeId]);

  const onWheel: React.WheelEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    zoomBy(event.deltaY < 0 ? 0.08 : -0.08);
  };

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (event) => {
    if ((event.target as HTMLElement).dataset.node === "true") {
      return;
    }

    dragStateRef.current.panStart = { x: event.clientX, y: event.clientY };
    setIsPanning(true);
  };

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (event) => {
    const nodeId = dragStateRef.current.nodeId;
    if (nodeId) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      const point = toWorldPoint(
        { x: event.clientX - rect.left, y: event.clientY - rect.top },
        center,
        viewport.scale,
        { x: viewport.offsetX, y: viewport.offsetY }
      );

      moveNode(nodeId, point.x, point.y, { snapToOrbit: true, magnetThreshold: 52 });
      return;
    }

    if (!dragStateRef.current.panStart) {
      return;
    }

    const dx = event.clientX - dragStateRef.current.panStart.x;
    const dy = event.clientY - dragStateRef.current.panStart.y;
    dragStateRef.current.panStart = { x: event.clientX, y: event.clientY };
    panBy(dx, dy);
  };

  const clearDrag = () => {
    dragStateRef.current.nodeId = null;
    dragStateRef.current.panStart = null;
    setIsPanning(false);
  };

  const onNodePointerDown = (event: React.PointerEvent, nodeId: string) => {
    event.stopPropagation();
    dragStateRef.current.nodeId = nodeId;
    setSelectedNodeId(nodeId);
    setInspectorCollapsed(false);

    if (connectionSourceId) {
      createConnectionTo(nodeId);
    }
  };

  const onInspectorResizeStart = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();

    const startX = event.clientX;
    const startWidth = inspectorWidth;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const next = startWidth + (startX - moveEvent.clientX);
      const clamped = Math.max(minInspectorWidth, Math.min(maxInspectorWidth, next));
      setInspectorWidth(clamped);
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const renderConnection = (connection: OrbitConnection) => {
    const from = map.nodes.find((node) => node.id === connection.from);
    const to = map.nodes.find((node) => node.id === connection.to);

    if (!from || !to) {
      return null;
    }

    return (
      <line
        key={connection.id}
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke="rgba(245,245,245,0.55)"
        strokeWidth={inverseScale}
      />
    );
  };

  const renderNode = (node: OrbitNode) => {
    const selected = node.id === selectedNodeId;

    return (
      <button
        key={node.id}
        type="button"
        data-node="true"
        onPointerDown={(event) => onNodePointerDown(event, node.id)}
        className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-lg border text-left transition-all ${
          selected
            ? "border-white bg-neutral-900 text-white"
            : "border-neutral-700 bg-neutral-950 text-neutral-200 hover:border-neutral-500"
        }`}
        style={{
          left: node.x,
          top: node.y,
          minWidth: zoomVisual.nodeMinWidth,
          minHeight: 42,
          padding: `${zoomVisual.nodePaddingY}px ${zoomVisual.nodePaddingX}px`,
          borderWidth: inverseScale,
          transition: "min-width 220ms ease, padding 220ms ease",
        }}
      >
        <div className="font-medium" style={{ fontSize: zoomVisual.nodeTitleSize }}>
          {node.title}
        </div>
        <div
          className="mt-1 uppercase tracking-wide text-neutral-400"
          style={{ fontSize: zoomVisual.nodeMetaSize }}
        >
          {node.status}
        </div>
      </button>
    );
  };

  return (
    <section className="relative flex h-full flex-1 bg-[#101010]">
      <div className="relative flex h-full flex-1 flex-col overflow-hidden" ref={canvasRef}>
        <div className="pointer-events-none absolute inset-0 z-20">
          <div className="pointer-events-auto absolute right-3 top-3 flex items-center gap-2 rounded-xl  p-2 mr-5">
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search topic "
              className="w-60 rounded-md border border-neutral-700 bg-[#171717] px-3 py-2 text-xs text-neutral-100 outline-none"
            />
            <button
              type="button"
              onClick={() => setInspectorCollapsed((value) => !value)}
              className="flex size-8 items-center justify-center rounded-md border border-neutral-700 bg-[#171717] text-neutral-300 transition-colors hover:text-neutral-100"
              aria-label={inspectorCollapsed ? "Open details panel" : "Close details panel"}
              title={inspectorCollapsed ? "Open details panel" : "Close details panel"}
            >
              {inspectorCollapsed ? <PanelRight size={16} /> : <PanelLeft size={16} />}
            </button>
          </div>

          <div className="pointer-events-auto fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3">
            {/* Dock toolbar */}
            <Dock
              items={[
                { icon: Plus, label: "Add Node", onClick: addNode },
                { icon: Grid2x2Check, label: "Auto Layout", onClick: autoLayout },
                {
                  icon: Link2,
                  label: connectionSourceId ? "Pick Target" : "Connect",
                  onClick: startConnection,
                  disabled: !selectedNodeId,
                  isActive: Boolean(connectionSourceId),
                },
                { icon: ZoomIn, label: "Zoom In", onClick: () => zoomBy(0.1) },
                { icon: ZoomOut, label: "Zoom Out", onClick: () => zoomBy(-0.1) },
                { icon: LocateFixed, label: "Reset View", onClick: resetView },
              ]}
            />
          </div>
        </div>

        <div
          className={`relative flex-1 overflow-hidden ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={clearDrag}
          onPointerLeave={clearDrag}
        >
          <div
            className="absolute inset-0"
            style={{
              transform: `translate(${viewport.offsetX}px, ${viewport.offsetY}px) scale(${viewport.scale})`,
              transformOrigin: "50% 50%",
            }}
          >
            <div
              className="absolute"
              style={{
                left: center.x,
                top: center.y,
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -left-[12000px] -top-[12000px] h-[24000px] w-[24000px]"
                style={{
                  // Keep visual line thickness at 1px while world scales.
                  // linePx * viewport.scale ~= 1 screen px
                  backgroundImage: showGrid
                    ? `linear-gradient(rgba(245,245,245,0.035) ${inverseScale}px, transparent ${inverseScale}px), linear-gradient(90deg, rgba(245,245,245,0.035) ${inverseScale}px, transparent ${inverseScale}px)`
                    : "none",
                  backgroundSize: `${zoomVisual.minorGrid}px ${zoomVisual.minorGrid}px, ${zoomVisual.minorGrid}px ${zoomVisual.minorGrid}px`,
                  backgroundPosition: "center, center",
                  transition: "background-size 220ms ease",
                }}
              />

              <svg
                className="pointer-events-none absolute -left-[1200px] -top-[1200px]"
                width={2400}
                height={2400}
                viewBox="-1200 -1200 2400 2400"
              >
                {map.rings.map((ring, index) => (
                  <g key={ring.id}>
                    {(() => {
                      const orbitColor = getOrbitColor(index, map.rings.length);

                      return (
                        <>
                          <circle
                            cx={0}
                            cy={0}
                            r={ring.radius}
                            fill="none"
                            stroke={orbitColor.stroke}
                            strokeWidth={inverseScale}
                          />
                          <text
                            x={ring.radius + 8}
                            y={-8}
                            fill={orbitColor.label}
                            fontSize={zoomVisual.ringLabelSize}
                          >
                            {ring.label} · {getRingCompletion(index, map.nodes)}%
                          </text>
                        </>
                      );
                    })()}
                  </g>
                ))}
                {visibleConnections.map((connection) => renderConnection(connection))}
              </svg>

              <div className="absolute inset-0">{map.nodes.map(renderNode)}</div>
            </div>
          </div>
        </div>
      </div>

      {!inspectorCollapsed && (
        <NodeInspector
          node={selectedNode}
          rings={map.rings}
          width={inspectorWidth}
          onResizeStart={onInspectorResizeStart}
          onUpdate={(nodeId, updates) => updateNode(nodeId, updates)}
          onAssignRing={assignNodeToRing}
          onDelete={deleteNode}
        />
      )}

    </section>
  );
}
