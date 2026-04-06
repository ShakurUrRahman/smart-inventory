import { Router } from "express";
import {
	getAllOrders,
	createOrder,
	updateOrderStatus,
	getOrderById,
} from "../controllers/orderController";
import { requireAuth, requireRole } from "../middleware/rbacMiddleware";

const router = Router();

router.use(requireAuth);
router.use(requireRole("admin", "manager", "super_admin"));

router.get("/", getAllOrders);
router.post("/", createOrder);
router.get("/:id", getOrderById);
router.patch("/:id/status", updateOrderStatus);

export default router;
