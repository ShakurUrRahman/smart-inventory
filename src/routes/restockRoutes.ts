import { Router } from "express";
import {
	getRestockQueue,
	resolveRestockItem,
	removeFromQueue,
} from "../controllers/restockController";
import { requireAuth, requireRole } from "../middleware/rbacMiddleware";

const router = Router();

router.use(requireAuth);
router.use(requireRole("admin", "manager", "super_admin"));

router.get("/", getRestockQueue);
router.patch("/:id/resolve", resolveRestockItem);
router.delete("/:id", removeFromQueue);

export default router;
