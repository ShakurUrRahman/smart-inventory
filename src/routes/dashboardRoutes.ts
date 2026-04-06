import { Router } from "express";
import {
	getDashboardStats,
	getOrdersChart,
	getRevenueChart,
	getProductSummary,
	getOrderStatusBreakdown,
	getRecentActivity,
} from "../controllers/dashboardController";
import { requireAuth, requireRole } from "../middleware/rbacMiddleware";

const router = Router();

router.use(requireAuth);
router.use(requireRole("admin", "manager", "super_admin"));

router.get("/stats", getDashboardStats);
router.get("/orders-chart", getOrdersChart);
router.get("/revenue-chart", getRevenueChart);
router.get("/product-summary", getProductSummary);
router.get("/status-breakdown", getOrderStatusBreakdown);
router.get("/activity", getRecentActivity);

export default router;
