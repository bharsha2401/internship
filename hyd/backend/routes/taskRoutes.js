import express from "express";
import {
  getMyTasks,
  getAllTasks,
  assignTask,
  updateTaskStatus
} from "../controllers/taskController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/mytasks", protect, getMyTasks);
router.get("/", protect, getAllTasks);
router.post("/assign", protect, assignTask);
router.patch("/status/:id", protect, updateTaskStatus);

export default router;
