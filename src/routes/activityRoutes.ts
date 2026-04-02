import { Router } from "express";
import { getActivityLogs } from "../controllers/activityController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get("/", getActivityLogs);

export default router;
