import type { ConceptCategory } from "./types";
import { categoryLabel } from "./types";

type Props = {
  activeGroup: "all" | ConceptCategory;
  onChangeGroup: (g: "all" | ConceptCategory) => void;
};

export default function NetworkToolbar({ activeGroup, onChangeGroup }: Props) {
  return (
    <div data-network-ui className="absolute top-4 left-4 z-30 flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChangeGroup("all")}
        className={[
          "h-10 px-4 rounded-xl border border-slate-200 bg-white/80 backdrop-blur",
          "text-sm font-semibold text-slate-800 hover:bg-white",
          "shadow-sm shadow-slate-900/5 transition-all",
        ].join(" ")}
      >
        All Topics
      </button>

      <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white/80 backdrop-blur p-1 shadow-sm shadow-slate-900/5">
        {(Object.keys(categoryLabel) as ConceptCategory[]).map((k) => {
          const active = activeGroup === k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => onChangeGroup(k)}
              className={[
                "h-9 px-3 rounded-lg text-xs font-semibold transition-all",
                active
                  ? "bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-sm shadow-emerald-500/20"
                  : "text-slate-700 hover:bg-slate-50",
              ].join(" ")}
            >
              {categoryLabel[k]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

