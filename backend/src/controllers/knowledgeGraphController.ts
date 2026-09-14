import { type Request, type Response, type NextFunction } from "express";
import * as kgService from "@/services/knowledgeGraphService.js";
import { AppError } from "@/middlewares/errorHandle.js";
import Document from "@/models/Document.js";

const verifyOwnership = async (req: Request) => {
  const documentId = req.params.documentId;
  const userId = req.user?.id;
  if (!userId) throw new AppError("Không có quyền truy cập", 401);
  
  const doc = await Document.findOne({ _id: documentId, userId });
  if (!doc) throw new AppError("Không tìm thấy tài liệu hoặc không có quyền truy cập", 403);
  
  return { userId, documentId };
};

export const getGraph = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, documentId } = await verifyOwnership(req);
    const graph = await kgService.getGraphService(userId, documentId);
    res.status(200).json({ success: true, data: graph });
  } catch (error) {
    next(error);
  }
};

/*
export const addNode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, documentId } = await verifyOwnership(req);
    const { version, nodeData } = req.body;
    if (version === undefined) throw new AppError("Thiếu version", 400);

    const graph = await kgService.addNodeService(userId, documentId, nodeData, Number(version));
    res.status(200).json({ success: true, data: graph });
  } catch (error) {
    next(error);
  }
};

export const updateNode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, documentId } = await verifyOwnership(req);
    const { nodeId } = req.params;
    const { version, nodeData } = req.body;
    if (version === undefined) throw new AppError("Thiếu version", 400);

    const graph = await kgService.updateNodeService(userId, documentId, nodeId, nodeData, Number(version));
    res.status(200).json({ success: true, data: graph });
  } catch (error) {
    next(error);
  }
};

export const deleteNode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, documentId } = await verifyOwnership(req);
    const { nodeId } = req.params;
    const version = req.body.version || req.query.version;
    if (version === undefined) throw new AppError("Thiếu version", 400);

    const graph = await kgService.deleteNodeService(userId, documentId, nodeId, Number(version));
    res.status(200).json({ success: true, data: graph });
  } catch (error) {
    next(error);
  }
};

export const addEdge = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, documentId } = await verifyOwnership(req);
    const { version, edgeData } = req.body;
    if (version === undefined) throw new AppError("Thiếu version", 400);

    const graph = await kgService.addEdgeService(userId, documentId, edgeData, Number(version));
    res.status(200).json({ success: true, data: graph });
  } catch (error) {
    next(error);
  }
};

export const updateEdge = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, documentId } = await verifyOwnership(req);
    const { edgeId } = req.params;
    const { version, edgeData } = req.body;
    if (version === undefined) throw new AppError("Thiếu version", 400);

    const graph = await kgService.updateEdgeService(userId, documentId, edgeId, edgeData, Number(version));
    res.status(200).json({ success: true, data: graph });
  } catch (error) {
    next(error);
  }
};

export const deleteEdge = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, documentId } = await verifyOwnership(req);
    const { edgeId } = req.params;
    const version = req.body.version || req.query.version;
    if (version === undefined) throw new AppError("Thiếu version", 400);

    const graph = await kgService.deleteEdgeService(userId, documentId, edgeId, Number(version));
    res.status(200).json({ success: true, data: graph });
  } catch (error) {
    next(error);
  }
};
*/
