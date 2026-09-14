import axiosInstance from "@/utils/axiosInstance";
import type { ConceptNode, ConceptEdge } from "@/types/network.types";

const PREFIX = "/knowledge-graph";

export interface KnowledgeGraphResponse {
  _id: string;
  documentId: string;
  status: "pending" | "processing" | "completed" | "failed";
  version: number;
  nodes: ConceptNode[];
  edges: ConceptEdge[];
  error?: string;
}

export const knowledgeGraphService = {
  getGraph: async (documentId: string): Promise<KnowledgeGraphResponse> => {
    const response = await axiosInstance.get(`${PREFIX}/documents/${documentId}`);
    return response.data.data;
  },

  addNode: async (
    documentId: string,
    nodeData: Partial<ConceptNode>,
    version: number
  ): Promise<KnowledgeGraphResponse> => {
    const response = await axiosInstance.post(`${PREFIX}/documents/${documentId}/nodes`, {
      nodeData,
      version,
    });
    return response.data.data;
  },

  updateNode: async (
    documentId: string,
    nodeId: string,
    nodeData: Partial<ConceptNode>,
    version: number
  ): Promise<KnowledgeGraphResponse> => {
    const response = await axiosInstance.put(
      `${PREFIX}/documents/${documentId}/nodes/${nodeId}`,
      {
        nodeData,
        version,
      }
    );
    return response.data.data;
  },

  deleteNode: async (
    documentId: string,
    nodeId: string,
    version: number
  ): Promise<KnowledgeGraphResponse> => {
    const response = await axiosInstance.delete(
      `${PREFIX}/documents/${documentId}/nodes/${nodeId}`,
      { data: { version } }
    );
    return response.data.data;
  },

  addEdge: async (
    documentId: string,
    edgeData: Partial<ConceptEdge>,
    version: number
  ): Promise<KnowledgeGraphResponse> => {
    const response = await axiosInstance.post(`${PREFIX}/documents/${documentId}/edges`, {
      edgeData,
      version,
    });
    return response.data.data;
  },

  updateEdge: async (
    documentId: string,
    edgeId: string,
    edgeData: Partial<ConceptEdge>,
    version: number
  ): Promise<KnowledgeGraphResponse> => {
    const response = await axiosInstance.put(
      `${PREFIX}/documents/${documentId}/edges/${edgeId}`,
      {
        edgeData,
        version,
      }
    );
    return response.data.data;
  },

  deleteEdge: async (
    documentId: string,
    edgeId: string,
    version: number
  ): Promise<KnowledgeGraphResponse> => {
    const response = await axiosInstance.delete(
      `${PREFIX}/documents/${documentId}/edges/${edgeId}`,
      { data: { version } }
    );
    return response.data.data;
  }
};
