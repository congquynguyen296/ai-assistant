import { useMemo, useState } from "react";
import ConceptMapCanvas from "./ConceptMapCanvas";
import ConceptDetailPanel from "./ConceptDetailPanel";
import NetworkControls from "./NetworkControls";
import NetworkToolbar from "./NetworkToolbar";
import { mockConcepts, mockEdges } from "./mockData";
import type { ConceptCategory } from "./types";

const DocumentNetworkTab = () => {
  const [activeGroup, setActiveGroup] = useState<"all" | ConceptCategory>(
    "all",
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<{
    zoomPercent: number;
    fit: () => void;
    zoomIn: () => void;
    zoomOut: () => void;
    autoLayout: () => void;
  } | null>(null);
  const concepts = useMemo(() => mockConcepts, []);
  const edges = useMemo(() => mockEdges, []);

  const selectedConcept = useMemo(
    () =>
      selectedId ? (concepts.find((c) => c.id === selectedId) ?? null) : null,
    [concepts, selectedId],
  );

  const getConceptById = (id: string) => concepts.find((c) => c.id === id);

  return (
    <div className="relative min-h-[75vh] overflow-hidden rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-xl shadow-lg shadow-slate-900/5">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none z-0" />

      <div className="absolute top-4 right-4 z-50">
        <div className="px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium shadow-md border border-yellow-200">
          Đây là phần giao diện demo, tính năng đang trong quá trình hoàn thiện
        </div>
      </div>

      <div className="relative h-[75vh] w-full z-10">
        <NetworkToolbar
          activeGroup={activeGroup}
          onChangeGroup={setActiveGroup}
        />
        <NetworkControls
          zoomPercent={view?.zoomPercent ?? 100}
          onZoomIn={() => view?.zoomIn()}
          onZoomOut={() => view?.zoomOut()}
          onFit={() => view?.fit()}
          onAutoLayout={() => view?.autoLayout()}
        />

        <ConceptMapCanvas
          activeGroup={activeGroup}
          concepts={concepts}
          edges={edges}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onViewChange={setView}
        />

        <ConceptDetailPanel
          isOpen={Boolean(selectedConcept)}
          concept={selectedConcept}
          activeGroup={activeGroup}
          getConceptById={getConceptById}
          onSelectConcept={setSelectedId}
          onClose={() => setSelectedId(null)}
        />
      </div>
    </div>
  );
};

export default DocumentNetworkTab;
