import { Router } from "express";
import { getActivityLogs } from "../controllers/activityController";
import { requireAuth, requireRole } from "../middleware/rbacMiddleware";

const router = Router();

router.use(requireAuth);
router.use(requireRole("admin", "manager", "super_admin"));

router.get("/", getActivityLogs);

export default router;
