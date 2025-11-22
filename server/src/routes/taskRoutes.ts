import { Router } from "express";
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  getUserTasks,
  updateTask,
  updateTaskStatus,
} from "../controllers/taskController";

const router = Router();

router.get("/", getTasks);
router.post("/", createTask);
router.get("/:taskId", getTaskById);
router.patch("/:taskId", updateTask);
router.patch("/:taskId/status", updateTaskStatus);
router.get("/user/:userId", getUserTasks);
router.delete("/:taskId", deleteTask);

export default router;
