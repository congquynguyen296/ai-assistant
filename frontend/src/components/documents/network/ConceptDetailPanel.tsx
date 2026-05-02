import { X } from "lucide-react";
import type { ConceptCategory, ConceptNodeData } from "./types";
import { categoryLabel } from "./types";

type Props = {
  isOpen: boolean;
  concept: ConceptNodeData | null;
  activeGroup: "all" | ConceptCategory;
  getConceptById: (id: string) => ConceptNodeData | undefined;
  onSelectConcept: (id: string) => void;
  onClose: () => void;
};

export default function ConceptDetailPanel({
  isOpen,
  concept,
  activeGroup,
  getConceptById,
  onSelectConcept,
  onClose,
}: Props) {
  return (
    <div
      data-network-ui
      className={[
        "absolute top-0 right-0 h-full w-[380px] max-w-[86vw] z-40",
        "border-l border-slate-200 bg-white/90 backdrop-blur-xl",
        "shadow-2xl shadow-slate-900/10",
        "transition-transform duration-200",
        isOpen ? "translate-x-0" : "translate-x-full",
      ].join(" ")}
    >
      {concept && (
        <div className="h-full flex flex-col">
          <div className="p-5 border-b border-slate-200">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-linear-to-br from-emerald-500 to-teal-500 shadow-sm shadow-emerald-500/20" />
                  <div className="min-w-0">
                    <div className="text-base font-semibold text-slate-900 truncate">
                      {concept.label}
                    </div>
                    <div className="mt-0.5 inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 text-[11px] font-semibold">
                      {categoryLabel[concept.category]}
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="h-9 w-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-all"
                aria-label="Close detail panel"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-5 space-y-6">
            <section className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Summary
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{concept.summary}</p>
            </section>

            <section className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Connected Concepts
              </div>
              <div className="space-y-2">
                {concept.connections.map((c) => {
                  const target = getConceptById(c.toId);
                  if (!target) return null;
                  if (activeGroup !== "all" && target.category !== activeGroup) return null;
                  return (
                    <button
                      key={`${concept.id}-${c.toId}`}
                      type="button"
                      onClick={() => onSelectConcept(c.toId)}
                      className="w-full text-left rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 transition-all"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900 truncate">
                            {target.label}
                          </div>
                          <div className="text-xs text-slate-500">{c.label}</div>
                        </div>
                        <div className="h-8 w-8 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">
                          ↗
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Citations
              </div>
              <div className="space-y-3">
                {concept.citations.map((c) => (
                  <div
                    key={c.location}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="text-xs font-semibold text-slate-500 mb-2">
                      {c.location}
                    </div>
                    <div className="text-sm text-slate-700 leading-relaxed">“{c.excerpt}”</div>
                    <button
                      type="button"
                      className="mt-3 h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all"
                    >
                      Read in Document
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="p-5 border-t border-slate-200">
            <button
              type="button"
              className="w-full h-11 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 transition-all"
            >
              Edit Concept
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

