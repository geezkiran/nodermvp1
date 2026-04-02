import type { OrbitNode, OrbitRing, NodeStatus } from "../types/editor";

type Props = {
  node: OrbitNode | null;
  rings: OrbitRing[];
  onUpdate: (nodeId: string, updates: Partial<OrbitNode>) => void;
  onAssignRing: (nodeId: string, ringIndex: number) => void;
  onDelete: (nodeId: string) => void;
};

const STATUSES: NodeStatus[] = ["not-started", "in-progress", "done"];

export function NodeInspector({
  node,
  rings,
  onUpdate,
  onAssignRing,
  onDelete,
}: Props) {
  if (!node) {
    return (
      <aside className="w-80 border-l border-neutral-800 bg-[#111] p-4 text-sm text-neutral-400">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-neutral-300">Details</span>
        </div>
        Select a concept node to edit details.
      </aside>
    );
  }

  return (
    <aside className="w-80 border-l border-neutral-800 bg-[#111] p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-neutral-200">Node Details</h3>
      </div>

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
    </aside>
  );
}
