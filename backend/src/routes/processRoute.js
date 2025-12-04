import express from "express";
import protect from "../middlewares/auth.js";
import { getDashboard } from "../controllers/processController.js";

const route = express.Router();

route.use(protect);

// Dashboard page
route.get("/", getDashboard);

export default route;
