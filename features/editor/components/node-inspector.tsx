import { useState } from "react";

import type { OrbitNode, OrbitRing, NodeStatus } from "../types/editor";

type Props = {
  node: OrbitNode | null;
  rings: OrbitRing[];
  width: number;
  onResizeStart: (event: React.PointerEvent<HTMLDivElement>) => void;
  onUpdate: (nodeId: string, updates: Partial<OrbitNode>) => void;
  onAssignRing: (nodeId: string, ringIndex: number) => void;
  onDelete: (nodeId: string) => void;
};

const STATUSES: NodeStatus[] = ["not-started", "in-progress", "done"];

export function NodeInspector({
  node,
  rings,
  width,
  onResizeStart,
  onUpdate,
  onAssignRing,
  onDelete,
}: Props) {
  const [mode, setMode] = useState<"viewer" | "editor">("viewer");

  if (!node) {
    return (
      <aside
        className="relative border-l border-neutral-800 bg-[#111] p-4 text-sm text-neutral-400"
        style={{ width }}
      >
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize details"
          onPointerDown={onResizeStart}
          className="absolute inset-y-0 -left-2 z-30 w-3 cursor-col-resize"
        />
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-neutral-300">Details</span>
        </div>
        Select a node to edit.
      </aside>
    );
  }

  const ringLabel = rings[node.ringIndex]?.label ?? `Level ${node.ringIndex + 1}`;

  return (
    <aside className="relative border-l border-neutral-800 bg-[#111] p-4" style={{ width }}>
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize details"
        onPointerDown={onResizeStart}
        className="absolute inset-y-0 -left-2 z-30 w-3 cursor-col-resize"
      />
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-regular text-white/50">Contents</h3>
        <div className="flex items-center rounded-md border border-neutral-700 bg-[#171717] p-0.5 text-[11px]">
          <button
            type="button"
            onClick={() => setMode("viewer")}
            className={`rounded px-2 py-1 transition-colors ${
              mode === "viewer" ? "bg-neutral-700 text-neutral-100" : "text-neutral-400"
            }`}
          >
            Viewer
          </button>
          <button
            type="button"
            onClick={() => setMode("editor")}
            className={`rounded px-2 py-1 transition-colors ${
              mode === "editor" ? "bg-neutral-700 text-neutral-100" : "text-neutral-400"
            }`}
          >
            Editor
          </button>
        </div>
      </div>

      {mode === "viewer" ? (
        <div className="space-y-6">
          <div>
            <h4 className="text-2xl font-semibold leading-tight text-neutral-100">{node.title}</h4>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-neutral-400">
              {node.description || "No description yet."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-neutral-800 px-2.5 py-1 capitalize text-neutral-200">
              {node.status}
            </span>
            <span className="rounded-full bg-neutral-800 px-2.5 py-1 text-neutral-200">
              {node.estimatedHours}h
            </span>
            <span className="rounded-full bg-neutral-800 px-2.5 py-1 text-neutral-200">
              {ringLabel}
            </span>
            <span className="rounded-full bg-neutral-800 px-2.5 py-1 text-neutral-200">
              Importance {node.importance}/10
            </span>
          </div>

          {/* Courses Section */}
          <div className="border-t border-neutral-800 pt-4">
            <h5 className="mb-3 text-sm font-medium text-neutral-300">Related Courses</h5>
            <div className="grid grid-cols-2 gap-3">
              {[
                { title: "Getting Started with React", duration: "2h 30m" },
                { title: "Advanced State Management", duration: "4h 15m" },
                { title: "Performance Optimization", duration: "3h 45m" },
              ].map((course, idx) => (
                <div key={idx} className="flex flex-col overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900/50 transition-all hover:border-neutral-600 hover:bg-neutral-900">
                  <div className="h-24 w-full bg-neutral-800" />
                  <div className="flex flex-1 flex-col justify-between p-2">
                    <p className="line-clamp-2 text-xs font-medium text-neutral-200">{course.title}</p>
                    <p className="text-xs text-neutral-400">{course.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <label className="mb-3 block text-xs text-neutral-400">
            Title
            <input
              value={node.title}
              onChange={(event) => onUpdate(node.id, { title: event.target.value })}
              className="mt-1 w-full rounded-md border border-neutral-700 bg-[#171717] px-2 py-1.5 text-sm text-neutral-100 outline-none"
            />
          </label>

          <label className="mb-3 block text-xs text-neutral-400">
            Description
            <textarea
              value={node.description}
              onChange={(event) => onUpdate(node.id, { description: event.target.value })}
              rows={4}
              className="mt-1 w-full resize-none rounded-md border border-neutral-700 bg-[#171717] px-2 py-1.5 text-sm text-neutral-100 outline-none"
            />
          </label>

          <label className="mb-3 block text-xs text-neutral-400">
            Status
            <select
              value={node.status}
              onChange={(event) => onUpdate(node.id, { status: event.target.value as NodeStatus })}
              className="mt-1 w-full rounded-md border border-neutral-700 bg-[#171717] px-2 py-1.5 text-sm text-neutral-100 outline-none"
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="mb-3 block text-xs text-neutral-400">
            Estimated Hours
            <input
              type="number"
              min={0}
              value={node.estimatedHours}
              onChange={(event) =>
                onUpdate(node.id, { estimatedHours: Number(event.target.value) || 0 })
              }
              className="mt-1 w-full rounded-md border border-neutral-700 bg-[#171717] px-2 py-1.5 text-sm text-neutral-100 outline-none"
            />
          </label>

          <label className="mb-3 block text-xs text-neutral-400">
            Orbit Level
            <select
              value={node.ringIndex}
              onChange={(event) => onAssignRing(node.id, Number(event.target.value))}
              className="mt-1 w-full rounded-md border border-neutral-600 bg-[#171717] px-2 py-1.5 text-sm text-neutral-100 outline-none"
            >
              {rings.map((ring, index) => (
                <option key={ring.id} value={index}>
                  {ring.label}
                </option>
              ))}
            </select>
          </label>

          <label className="mb-4 block text-xs text-neutral-400">
            Importance
            <input
              type="range"
              min={1}
              max={10}
              value={node.importance}
              onChange={(event) => onUpdate(node.id, { importance: Number(event.target.value) })}
              className="mt-2 w-full"
            />
          </label>

          <button
            type="button"
            onClick={() => onDelete(node.id)}
            className="rounded-md border border-red-400/40 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10"
          >
            Delete Node
          </button>
        </>
      )}
    </aside>
  );
}
