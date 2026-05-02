import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { ConceptNodeData } from "./types";

export type ConceptFlowNodeData = ConceptNodeData & {
  selected?: boolean;
};

export default function ConceptNode(props: NodeProps) {
  const { data } = props as NodeProps;
  const conceptData = data as ConceptFlowNodeData;

  const size = conceptData.importance === 3 ? 74 : conceptData.importance === 2 ? 64 : 56;
  const ring =
    conceptData.importance === 3
      ? "ring-4 ring-emerald-200/70"
      : conceptData.importance === 2
        ? "ring-2 ring-emerald-200/60"
        : "ring-1 ring-emerald-200/50";
  const fill =
    conceptData.importance === 3
      ? "from-emerald-500 to-teal-500"
      : conceptData.importance === 2
        ? "from-emerald-400 to-teal-400"
        : "from-emerald-300 to-teal-300";

  const isSelected = Boolean(conceptData.selected);

  return (
    <div
      className={[
        "rounded-full select-none",
        "shadow-lg shadow-emerald-500/10",
        "transition-transform duration-150",
        isSelected ? "scale-[1.02]" : "hover:scale-[1.01]",
      ].join(" ")}
      style={{ width: size, height: size }}
      data-node
    >
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <Handle type="source" position={Position.Right} className="opacity-0" />

      <div
        className={[
          "h-full w-full rounded-full",
          ring,
          "bg-linear-to-br",
          fill,
          "border border-white/60",
          "flex items-center justify-center",
        ].join(" ")}
      >
        <div className="px-2 text-center">
          <div className="text-[11px] leading-tight font-semibold text-white drop-shadow-sm line-clamp-2">
            {conceptData.label}
          </div>
        </div>
      </div>
    </div>
  );
}

