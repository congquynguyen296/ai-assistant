import "@xyflow/react/dist/style.css";
import {
  Background,
  BackgroundVariant,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  Position,
  type XYPosition,
  type Edge,
  type Node,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { forceCollide, forceManyBody, forceSimulation, forceX, forceY } from "d3-force";
import dagre from "dagre";
import ConceptNode, { type ConceptFlowNodeData } from "./ConceptNode";
import type { ConceptCategory, ConceptNodeData } from "./types";

type Props = {
  activeGroup: "all" | ConceptCategory;
  concepts: ConceptNodeData[];
  edges: Array<{ from: string; to: string }>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onNodesReposition?: (positions: Array<{ id: string; x: number; y: number }>) => void;
  onViewChange?: (v: {
    zoomPercent: number;
    fit: () => void;
    zoomIn: () => void;
    zoomOut: () => void;
    autoLayout: () => void;
  }) => void;
};

function buildSpanningTreeEdges(rootId: string, edges: Array<{ from: string; to: string }>) {
  const outgoing = new Map<string, string[]>();
  for (const e of edges) {
    const list = outgoing.get(e.from) ?? [];
    list.push(e.to);
    outgoing.set(e.from, list);
  }

  const visited = new Set<string>([rootId]);
  const q: string[] = [rootId];
  const tree: Array<{ from: string; to: string }> = [];

  while (q.length) {
    const u = q.shift()!;
    const children = outgoing.get(u) ?? [];
    for (const v of children) {
      if (visited.has(v)) continue;
      visited.add(v);
      tree.push({ from: u, to: v });
      q.push(v);
    }
  }

  return tree;
}

// React Flow's NodeTypes typing is intentionally generic; we keep our node strongly typed at usage sites.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeTypes = { concept: ConceptNode } as any;

function useWheelTrapInFlow() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      const target = e.target as Element | null;
      if (!target) return;
      if (!el.contains(target)) return;
      if (target.closest("[data-network-ui]")) return;

      // Keep wheel interactions inside this area (avoid scrolling parent pages)
      // Prevent page scroll, but don't stop propagation (React Flow still needs the event).
      e.preventDefault();
    };

    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    return () => window.removeEventListener("wheel", onWheel as EventListener, { capture: true } as AddEventListenerOptions);
  }, []);

  return wrapperRef;
}

function FlowInner({
  activeGroup,
  concepts,
  edges,
  selectedId,
  onSelect,
  onNodesReposition,
  onViewChange,
}: Props) {
  const reactFlow = useReactFlow();
  const wheelTrapRef = useWheelTrapInFlow();
  const viewApiRef = useRef<{
    fit: () => void;
    zoomIn: () => void;
    zoomOut: () => void;
    autoLayout: () => void;
  } | null>(null);

  const visibleConcepts = useMemo(() => {
    if (activeGroup === "all") return concepts;
    return concepts.filter((c) => c.category === activeGroup);
  }, [activeGroup, concepts]);

  const visibleIds = useMemo(() => new Set(visibleConcepts.map((c) => c.id)), [visibleConcepts]);

  const rootId = useMemo(() => {
    // Prefer a stable "core" root if present; fallback to first visible concept.
    const preferred = visibleConcepts.find((c) => c.id === "nn")?.id;
    return preferred ?? visibleConcepts[0]?.id ?? "root";
  }, [visibleConcepts]);

  const visibleRawEdges = useMemo(
    () => edges.filter((e) => visibleIds.has(e.from) && visibleIds.has(e.to)),
    [edges, visibleIds]
  );

  const treeEdges = useMemo(() => buildSpanningTreeEdges(rootId, visibleRawEdges), [rootId, visibleRawEdges]);

  const flowNodes = useMemo<Node<ConceptFlowNodeData>[]>(() => {
    return visibleConcepts.map((c, idx) => {
      const baseX = (idx % 3) * 220 - 220;
      const baseY = Math.floor(idx / 3) * 170 - 120;
      return {
        id: c.id,
        type: "concept",
        position: { x: baseX, y: baseY },
        data: { concept: c, selected: false },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      };
    });
  }, [visibleConcepts]);

  const flowEdges = useMemo<Edge[]>(() => {
    // Tree mode by default: use spanning-tree edges to avoid cycles / clutter.
    return treeEdges
      .map((e) => ({
        id: `${e.from}-${e.to}`,
        source: e.from,
        target: e.to,
        type: "smoothstep",
        style: { stroke: "rgba(15, 118, 110, 0.35)", strokeWidth: 2 },
      }));
  }, [treeEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edgesState, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  useEffect(() => {
    setNodes(flowNodes);
  }, [flowNodes, setNodes]);

  useEffect(() => {
    setEdges(flowEdges);
  }, [flowEdges, setEdges]);

  useEffect(() => {
    // Keep selection highlight in sync
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        data: { ...n.data, selected: n.id === selectedId },
      }))
    );
  }, [selectedId, setNodes]);

  const fit = useCallback(() => {
    reactFlow.fitView({ padding: 0.25, duration: 250 });
  }, [reactFlow]);

  const zoomIn = useCallback(() => {
    reactFlow.zoomIn({ duration: 200 });
  }, [reactFlow]);

  const zoomOut = useCallback(() => {
    reactFlow.zoomOut({ duration: 200 });
  }, [reactFlow]);

  const runAutoLayout = useCallback(
    (direction: "LR" | "TB" = "LR") => {
      const g = new dagre.graphlib.Graph();
      g.setDefaultEdgeLabel(() => ({}));
      g.setGraph({
        rankdir: direction,
        nodesep: 60,
        ranksep: 90,
      });

      const currentNodes = reactFlow.getNodes();
      const currentEdges = reactFlow.getEdges();

      for (const n of currentNodes) {
        const imp = (n.data as ConceptFlowNodeData | undefined)?.concept?.importance ?? 1;
        const size = imp === 3 ? 74 : imp === 2 ? 64 : 56;
        g.setNode(n.id, { width: size + 30, height: size + 30 });
      }

      for (const e of currentEdges) {
        g.setEdge(e.source, e.target);
      }

      dagre.layout(g);

      const nextPositions: Array<{ id: string; x: number; y: number }> = [];
      setNodes((prev) =>
        prev.map((n) => {
          const p = g.node(n.id) as { x: number; y: number } | undefined;
          if (!p) return n;
          // dagre gives center positions; React Flow uses top-left.
          const next: XYPosition = { x: p.x - (n.width ?? 0) / 2, y: p.y - (n.height ?? 0) / 2 };
          nextPositions.push({ id: n.id, x: next.x, y: next.y });
          return { ...n, position: next };
        })
      );
      onNodesReposition?.(nextPositions);
      // Fit after layout
      requestAnimationFrame(() => {
        reactFlow.fitView({ padding: 0.25, duration: 250 });
      });
    },
    [onNodesReposition, reactFlow, setNodes]
  );

  useEffect(() => {
    viewApiRef.current = { fit, zoomIn, zoomOut, autoLayout: () => runAutoLayout("TB") };
    onViewChange?.({
      zoomPercent: Math.round(reactFlow.getViewport().zoom * 100),
      fit,
      zoomIn,
      zoomOut,
      autoLayout: () => runAutoLayout("TB"),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onViewChange, fit, zoomIn, zoomOut, runAutoLayout]);

  const syncZoomPercent = useCallback(
    (zoom: number) => {
      const api = viewApiRef.current;
      if (!api) return;
      onViewChange?.({
        zoomPercent: Math.round(zoom * 100),
        ...api,
      });
    },
    [onViewChange]
  );

  useEffect(() => {
    fit();
    // keep graph tidy when switching groups
    runAutoLayout("TB");
  }, [activeGroup, fit, runAutoLayout]);

  const runCollisionRelax = useCallback(() => {
    const current = reactFlow.getNodes();
    if (current.length <= 1) return;

    const simNodes = current.map((n) => ({
      id: n.id,
      x: n.position.x,
      y: n.position.y,
    }));

    const radiusById = new Map<string, number>();
    for (const n of current) {
      const imp = (n.data as ConceptFlowNodeData | undefined)?.concept?.importance ?? 1;
      const r = imp === 3 ? 44 : imp === 2 ? 38 : 34;
      radiusById.set(n.id, r);
    }

    const sim = forceSimulation(simNodes as any)
      .alpha(0.8)
      .alphaDecay(0.08)
      .force("charge", forceManyBody().strength(-60))
      .force("x", forceX(0).strength(0.02))
      .force("y", forceY(0).strength(0.02))
      .force(
        "collide",
        forceCollide((d: any) => (radiusById.get(d.id) ?? 34) + 8).iterations(2)
      )
      .stop();

    for (let i = 0; i < 40; i += 1) sim.tick();

    const nextPositions = simNodes.map((n) => ({ id: n.id, x: n.x ?? 0, y: n.y ?? 0 }));
    onNodesReposition?.(nextPositions);
    setNodes((prev) =>
      prev.map((n) => {
        const p = nextPositions.find((x) => x.id === n.id);
        return p ? { ...n, position: { x: p.x, y: p.y } } : n;
      })
    );
  }, [onNodesReposition, reactFlow, setNodes]);

  return (
    <div ref={wheelTrapRef} className="absolute inset-0 overscroll-contain">
      <ReactFlow
        nodes={nodes}
        edges={edgesState}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, n) => onSelect(n.id)}
        onPaneClick={() => onSelect(null)}
        onNodeDragStop={() => runCollisionRelax()}
        onMove={(_, viewport) => syncZoomPercent(viewport.zoom)}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        zoomOnScroll
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          type: "smoothstep",
          style: { stroke: "rgba(15, 118, 110, 0.35)", strokeWidth: 2 },
        }}
        className="bg-transparent!"
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e5e7eb" />
      </ReactFlow>
    </div>
  );
}

export default function ConceptMapCanvas(props: Props) {
  return (
    <ReactFlowProvider>
      <FlowInner {...props} />
    </ReactFlowProvider>
  );
}

