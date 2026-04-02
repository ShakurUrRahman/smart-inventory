import { Router } from "express";
import {
	getAllOrders,
	createOrder,
	getOrderById,
	updateOrderStatus,
} from "../controllers/orderController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get("/", getAllOrders);
router.post("/", createOrder);
router.get("/:id", getOrderById);
router.patch("/:id/status", updateOrderStatus);

export default router;
