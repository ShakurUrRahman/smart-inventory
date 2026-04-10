import { Router } from "express";
import {
	getRestockQueue,
	resolveRestockItem,
	removeFromQueue,
} from "../controllers/restockController";
import { requireAuth, requireRole } from "../middleware/rbacMiddleware";

const router = Router();

router.use(requireAuth);

router.get("/", getRestockQueue);
// router.get("/:id", getRestockByUserId);
router.patch("/:id/resolve", resolveRestockItem);
router.delete("/:id", removeFromQueue);

export default router;
