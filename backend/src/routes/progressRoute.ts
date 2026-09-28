import express from "express";
import protect from "@/middlewares/auth.js";
import { getDashboard } from "@/controllers/progressController.js";

import { apiLimiter } from "@/middlewares/rateLimiter.js";

const route = express.Router();

route.use(protect);
route.use(apiLimiter);

route.get("/dashboard", getDashboard);

export default route;
