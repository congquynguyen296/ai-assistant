import express from "express";
import * as kgController from "@/controllers/knowledgeGraphController.js";
import protect from "@/middlewares/auth.js";

const router = express.Router();

router.use(protect);

router.get("/documents/:documentId", kgController.getGraph);

/*
router.post("/documents/:documentId/nodes", kgController.addNode);
router.put("/documents/:documentId/nodes/:nodeId", kgController.updateNode);
router.delete("/documents/:documentId/nodes/:nodeId", kgController.deleteNode);

router.post("/documents/:documentId/edges", kgController.addEdge);
router.put("/documents/:documentId/edges/:edgeId", kgController.updateEdge);
router.delete("/documents/:documentId/edges/:edgeId", kgController.deleteEdge);
*/

export default router;
