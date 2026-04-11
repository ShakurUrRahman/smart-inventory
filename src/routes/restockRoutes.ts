import { Router } from "express";
import {
	getRestockQueue,
	resolveRestockItem,
	removeFromQueue,
} from "../controllers/restockController";
import {
	requireAuth,
	requireOwnershipOrRole,
} from "../middleware/rbacMiddleware";

const router = Router();

router.use(requireAuth);

// GET restock queue - users see only their products, admins see all
router.get("/", getRestockQueue);

// RESOLVE restock item - user can resolve own, admins can resolve any
router.patch(
	"/:id/resolve",
	requireOwnershipOrRole(["user", "admin", "manager", "super_admin"]),
	resolveRestockItem,
);

// DELETE from queue - user can delete own, admins can delete any
router.delete(
	"/:id",
	requireOwnershipOrRole(["user", "admin", "manager", "super_admin"]),
	removeFromQueue,
);

export default router;
