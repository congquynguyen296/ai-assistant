import mongoose from "mongoose";
import KnowledgeGraph, {
  type KnowledgeGraphDocument,
  type ConceptNode,
  type ConceptEdge,
} from "@/models/KnowledgeGraph.js";
import Document from "@/models/Document.js";
import { AppError } from "@/middlewares/errorHandle.js";

// Helper to check version
const checkVersion = (
  currentVersion: number,
  clientVersion: number,
) => {
  if (currentVersion !== clientVersion) {
    throw new AppError("Dữ liệu đã bị thay đổi bởi luồng khác. Vui lòng tải lại trang (F5).", 409);
  }
};

export const getGraphService = async (
  userId: string,
  documentId: string,
): Promise<KnowledgeGraphDocument> => {
  const graph = await KnowledgeGraph.findOne({ documentId, userId });
  if (!graph) {
    const doc = await Document.findOne({ _id: documentId, userId });
    if (!doc) {
      throw new AppError("Không tìm thấy tài liệu", 404);
    }
    if (doc.status === "processing" || doc.status === "ready") {
      // Mock the graph data as processing so the UI shows the loading component
      return {
        _id: new mongoose.Types.ObjectId(),
        documentId: new mongoose.Types.ObjectId(documentId),
        userId: new mongoose.Types.ObjectId(userId),
        status: "processing",
        nodes: [],
        edges: [],
        version: 1,
      } as unknown as KnowledgeGraphDocument;
    }
    throw new AppError("Không tìm thấy sơ đồ kiến thức", 404);
  }
  return graph;
};

/*
// LÝ DO COMMENT: 
// Hiện tại tính năng Knowledge Graph chỉ được Auto-generate từ AI Engine. 
// Frontend chưa có UI nào cho phép user thủ công thêm/sửa/xóa (CRUD) Node và Edge (hoặc chỉ sửa state local).
// Để tránh code thừa và over-engineering, các hàm này được comment lại. Khi nào UI cần sẽ mở ra.

export const addNodeService = async (
  userId: string,
  documentId: string,
  nodeData: Partial<ConceptNode>,
  clientVersion: number,
): Promise<KnowledgeGraphDocument> => {
  const graph = await KnowledgeGraph.findOne({ documentId, userId });
  if (!graph) throw new AppError("Không tìm thấy sơ đồ kiến thức", 404);
  
  checkVersion(graph.version, clientVersion);

  const newNode = {
    id: new mongoose.Types.ObjectId().toString(),
    label: nodeData.label || "New Concept",
    category: nodeData.category || "core",
    importance: nodeData.importance || 2,
    summary: nodeData.summary || "",
    position: nodeData.position || { x: 100, y: 100 },
    citations: nodeData.citations || [],
  };

  graph.nodes.push(newNode);
  graph.version += 1;
  
  await graph.save();
  return graph;
};

export const updateNodeService = async (
  userId: string,
  documentId: string,
  nodeId: string,
  nodeData: Partial<ConceptNode>,
  clientVersion: number,
): Promise<KnowledgeGraphDocument> => {
  const graph = await KnowledgeGraph.findOne({ documentId, userId });
  if (!graph) throw new AppError("Không tìm thấy sơ đồ kiến thức", 404);
  
  checkVersion(graph.version, clientVersion);

  const nodeIndex = graph.nodes.findIndex((n) => n.id === nodeId);
  if (nodeIndex === -1) throw new AppError("Không tìm thấy Node", 404);

  const node = graph.nodes[nodeIndex] as any;
  if (node.set) {
    node.set(nodeData);
  } else {
    Object.assign(node, nodeData);
  }

  graph.version += 1;

  // Need to mark array as modified if making deep updates
  graph.markModified("nodes");
  
  await graph.save();
  return graph;
};

export const deleteNodeService = async (
  userId: string,
  documentId: string,
  nodeId: string,
  clientVersion: number,
): Promise<KnowledgeGraphDocument> => {
  const graph = await KnowledgeGraph.findOne({ documentId, userId });
  if (!graph) throw new AppError("Không tìm thấy sơ đồ kiến thức", 404);
  
  checkVersion(graph.version, clientVersion);

  const nodeIndex = graph.nodes.findIndex((n) => n.id === nodeId);
  if (nodeIndex === -1) throw new AppError("Không tìm thấy Node", 404);

  // 1. Delete the node
  graph.nodes.splice(nodeIndex, 1);

  // 2. Cascade delete connected edges
  graph.edges = graph.edges.filter(
    (edge) => edge.from !== nodeId && edge.to !== nodeId
  );

  graph.version += 1;
  graph.markModified("nodes");
  graph.markModified("edges");
  
  await graph.save();
  return graph;
};

export const addEdgeService = async (
  userId: string,
  documentId: string,
  edgeData: Partial<ConceptEdge>,
  clientVersion: number,
): Promise<KnowledgeGraphDocument> => {
  const graph = await KnowledgeGraph.findOne({ documentId, userId });
  if (!graph) throw new AppError("Không tìm thấy sơ đồ kiến thức", 404);
  
  checkVersion(graph.version, clientVersion);

  if (!edgeData.from || !edgeData.to) {
    throw new AppError("Thiếu from hoặc to", 400);
  }

  const newEdge = {
    id: new mongoose.Types.ObjectId().toString(),
    from: edgeData.from,
    to: edgeData.to,
    label: edgeData.label || "",
  };

  graph.edges.push(newEdge);
  graph.version += 1;
  
  await graph.save();
  return graph;
};

export const updateEdgeService = async (
  userId: string,
  documentId: string,
  edgeId: string,
  edgeData: Partial<ConceptEdge>,
  clientVersion: number,
): Promise<KnowledgeGraphDocument> => {
  const graph = await KnowledgeGraph.findOne({ documentId, userId });
  if (!graph) throw new AppError("Không tìm thấy sơ đồ kiến thức", 404);
  
  checkVersion(graph.version, clientVersion);

  const edgeIndex = graph.edges.findIndex((e) => e.id === edgeId);
  if (edgeIndex === -1) throw new AppError("Không tìm thấy Edge", 404);

  const edge = graph.edges[edgeIndex] as any;
  if (edge.set) {
    edge.set(edgeData);
  } else {
    Object.assign(edge, edgeData);
  }

  graph.version += 1;
  graph.markModified("edges");
  
  await graph.save();
  return graph;
};

export const deleteEdgeService = async (
  userId: string,
  documentId: string,
  edgeId: string,
  clientVersion: number,
): Promise<KnowledgeGraphDocument> => {
  const graph = await KnowledgeGraph.findOne({ documentId, userId });
  if (!graph) throw new AppError("Không tìm thấy sơ đồ kiến thức", 404);
  
  checkVersion(graph.version, clientVersion);

  const edgeIndex = graph.edges.findIndex((e) => e.id === edgeId);
  if (edgeIndex === -1) throw new AppError("Không tìm thấy Edge", 404);

  graph.edges.splice(edgeIndex, 1);
  graph.version += 1;
  graph.markModified("edges");
  
  await graph.save();
  return graph;
};
*/
