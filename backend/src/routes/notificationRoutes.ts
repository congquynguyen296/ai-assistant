import express from "express";
import { getNotifications, markAsRead, markAllAsRead, deleteAllRead } from "@/controllers/notificationController.js";
import authMiddleware from "@/middlewares/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getNotifications);
router.put("/mark-all-read", markAllAsRead);
router.delete("/delete-all-read", deleteAllRead);
router.put("/:id/read", markAsRead);

export default router;
