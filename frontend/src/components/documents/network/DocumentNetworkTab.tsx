import { useMemo, useState, useEffect } from "react";
import ConceptMapCanvas from "./ConceptMapCanvas";
import ConceptDetailPanel from "./ConceptDetailPanel";
import NetworkControls from "./NetworkControls";
import NetworkToolbar from "./NetworkToolbar";
import type { ConceptCategory, ConceptNode, ConceptEdge } from "@/types/network.types";
import { knowledgeGraphService, type KnowledgeGraphResponse } from "@/services/networkService";
import { toast } from "sonner";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const DocumentNetworkTab = (props: { documentId: string }) => {
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
  const [graphData, setGraphData] = useState<KnowledgeGraphResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const fetchGraph = async (isPolling = false) => {
      try {
        if (!isPolling) setLoading(true);
        const data = await knowledgeGraphService.getGraph(props.documentId);
        setGraphData(data);

        // Continue polling if still processing
        if (data.status === "pending" || data.status === "processing") {
          timeoutId = setTimeout(() => fetchGraph(true), 3000);
        }
      } catch (err: any) {
        setError(err.response?.data?.error || "Lỗi khi lấy dữ liệu");
        if (!isPolling) toast.error("Không thể tải sơ đồ kiến thức");
      } finally {
        if (!isPolling) setLoading(false);
      }
    };

    if (props.documentId) {
      fetchGraph();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [props.documentId]);

  const handleNodeReposition = (id: string, x: number, y: number) => {
    if (!graphData) return;
    
    // Just optimistic update locally without saving to backend yet
    setGraphData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        nodes: prev.nodes.map((n) => (n.id === id ? { ...n, position: { x, y } } : n)),
      };
    });
  };

  const concepts = useMemo(() => graphData?.nodes || [], [graphData]);
  const edges = useMemo(() => graphData?.edges || [], [graphData]);

  const selectedConcept = useMemo(
    () =>
      selectedId ? (concepts.find((c) => c.id === selectedId) ?? null) : null,
    [concepts, selectedId],
  );

  const getConceptById = (id: string) => concepts.find((c) => c.id === id);

  if (loading) return <LoadingSpinner />;
  
  if (error || graphData?.status === "failed") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-100 max-w-md w-full shadow-sm">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Lỗi xử lý</h3>
          <p className="text-red-600 mb-6 leading-relaxed">{error || graphData?.error || "Đã xảy ra lỗi không xác định."}</p>
          <button onClick={() => window.location.reload()} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors w-full shadow-sm shadow-red-200">
            Thử tải lại trang
          </button>
        </div>
      </div>
    );
  }

  if (graphData?.status === "processing" || graphData?.status === "pending") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="p-8 text-center bg-amber-50 rounded-2xl border border-amber-100 max-w-md w-full shadow-sm">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mx-auto mb-6">
            <LoadingSpinner size="md" />
          </div>
          <h3 className="text-lg font-semibold text-amber-800 mb-2">Đang phân tích tài liệu</h3>
          <p className="text-amber-700 leading-relaxed text-sm">
            AI đang đọc và bóc tách các khái niệm trong tài liệu của bạn. Quá trình này có thể mất vài chục giây tùy thuộc vào độ dài tài liệu.<br/><br/>
            Sơ đồ sẽ tự động hiện lên ngay khi hoàn tất.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[75vh] overflow-hidden rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-xl shadow-lg shadow-slate-900/5">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none z-0" />

      {/* <div className="absolute top-4 right-4 z-50">
        <div className="px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium shadow-md border border-yellow-200">
          Đây là phần giao diện demo, tính năng đang trong quá trình hoàn thiện
        </div>
      </div> */}

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
          onNodeReposition={handleNodeReposition}
        />

        <ConceptDetailPanel
          isOpen={Boolean(selectedConcept)}
          concept={selectedConcept}
          activeGroup={activeGroup}
          getConceptById={getConceptById}
          onSelectConcept={setSelectedId}
          onClose={() => setSelectedId(null)}
          edges={edges}
        />
      </div>
    </div>
  );
};

export default DocumentNetworkTab;
