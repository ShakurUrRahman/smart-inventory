import { Router } from "express";
import {
	getDashboardStats,
	getOrdersChart,
	getRevenueChart,
	getProductSummary,
	getOrderStatusBreakdown,
	getRecentActivity,
} from "../controllers/dashboardController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get("/stats", getDashboardStats);
router.get("/orders-chart", getOrdersChart);
router.get("/revenue-chart", getRevenueChart);
router.get("/product-summary", getProductSummary);
router.get("/status-breakdown", getOrderStatusBreakdown);
router.get("/activity", getRecentActivity);

export default router;
