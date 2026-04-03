import { Request, Response } from "express";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { RestockQueue } from "../models/RestockQueue";
import { ActivityLog } from "../models/ActivityLog";

// Get Dashboard Stats
export const getDashboardStats = async (req: Request, res: Response) => {
	try {
		const now = new Date();
		const todayStart = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate(),
		);
		const todayEnd = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate(),
			23,
			59,
			59,
		);

		// Get all stats in parallel
		const [
			totalOrdersToday,
			pendingOrders,
			confirmedOrders,
			shippedOrders,
			deliveredOrders,
			lowStockCount,
			totalProducts,
			totalActiveProducts,
			revenueResult,
		] = await Promise.all([
			Order.countDocuments({
				createdAt: { $gte: todayStart, $lte: todayEnd },
			}),
			Order.countDocuments({ status: "Pending" }),
			Order.countDocuments({ status: "Confirmed" }),
			Order.countDocuments({ status: "Shipped" }),
			Order.countDocuments({ status: "Delivered" }),
			RestockQueue.countDocuments({ isResolved: false }),
			Product.countDocuments(),
			Product.countDocuments({ status: "Active" }),
			Order.aggregate([
				{
					$match: {
						createdAt: { $gte: todayStart, $lte: todayEnd },
						status: { $ne: "Cancelled" },
					},
				},
				{
					$group: {
						_id: null,
						total: { $sum: "$totalPrice" },
					},
				},
			]),
		]);

		const revenueToday = revenueResult[0]?.total || 0;

		res.status(200).json({
			success: true,
			data: {
				totalOrdersToday,
				pendingOrders,
				confirmedOrders,
				shippedOrders,
				deliveredOrders,
				revenueToday,
				lowStockCount,
				totalProducts,
				totalActiveProducts,
			},
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: "Failed to fetch dashboard stats",
			error: error.message,
		});
	}
};

// Get Orders Chart Data (Last 7 Days)
export const getOrdersChart = async (req: Request, res: Response) => {
	try {
		const today = new Date();
		const sevenDaysAgo = new Date(
			today.getTime() - 6 * 24 * 60 * 60 * 1000,
		);

		const result = await Order.aggregate([
			{
				$match: {
					createdAt: { $gte: sevenDaysAgo },
					status: { $ne: "Cancelled" },
				},
			},
			{
				$group: {
					_id: {
						$dateToString: {
							format: "%Y-%m-%d",
							date: "$createdAt",
						},
					},
					count: { $sum: 1 },
				},
			},
			{
				$sort: { _id: 1 },
			},
		]);

		// Fill in missing days with 0
		const chartData = [];
		for (let i = 6; i >= 0; i--) {
			const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
			const dateStr = date.toISOString().split("T")[0];
			const found = result.find((r) => r._id === dateStr);
			const dayName = date.toLocaleDateString("en-US", {
				weekday: "short",
			});

			chartData.push({
				date: dayName,
				dateStr,
				count: found?.count || 0,
			});
		}

		res.status(200).json({
			success: true,
			data: chartData,
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: "Failed to fetch orders chart",
			error: error.message,
		});
	}
};

// Get Revenue Chart Data (Last 7 Days)
export const getRevenueChart = async (req: Request, res: Response) => {
	try {
		const today = new Date();
		const sevenDaysAgo = new Date(
			today.getTime() - 6 * 24 * 60 * 60 * 1000,
		);

		const result = await Order.aggregate([
			{
				$match: {
					createdAt: { $gte: sevenDaysAgo },
					status: { $ne: "Cancelled" },
				},
			},
			{
				$group: {
					_id: {
						$dateToString: {
							format: "%Y-%m-%d",
							date: "$createdAt",
						},
					},
					revenue: { $sum: "$totalPrice" },
				},
			},
			{
				$sort: { _id: 1 },
			},
		]);

		// Fill in missing days with 0
		const chartData = [];
		for (let i = 6; i >= 0; i--) {
			const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
			const dateStr = date.toISOString().split("T")[0];
			const found = result.find((r) => r._id === dateStr);
			const dayName = date.toLocaleDateString("en-US", {
				weekday: "short",
			});

			chartData.push({
				date: dayName,
				dateStr,
				revenue: Math.round((found?.revenue || 0) * 100) / 100,
			});
		}

		res.status(200).json({
			success: true,
			data: chartData,
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: "Failed to fetch revenue chart",
			error: error.message,
		});
	}
};

// Get Product Summary (Top 8 Low Stock)
export const getProductSummary = async (req: Request, res: Response) => {
	try {
		const products = await Product.find()
			.populate("category", "name")
			.sort({ stock: 1 })
			.limit(8)
			.select("name stock price minStockThreshold status category");

		const formattedProducts = products.map((p: any) => ({
			_id: p._id,
			name: p.name,
			stock: p.stock,
			price: p.price,
			minStockThreshold: p.minStockThreshold,
			status: p.status,
			category: p.category?.name || p.category,
		}));

		res.status(200).json({
			success: true,
			data: formattedProducts,
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: "Failed to fetch product summary",
			error: error.message,
		});
	}
};

// Get Order Status Breakdown
export const getOrderStatusBreakdown = async (req: Request, res: Response) => {
	try {
		const result = await Order.aggregate([
			{
				$group: {
					_id: "$status",
					count: { $sum: 1 },
				},
			},
			{
				$sort: { count: -1 },
			},
		]);

		const breakdown = result.map((r) => ({
			status: r._id,
			count: r.count,
		}));

		res.status(200).json({
			success: true,
			data: breakdown,
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: "Failed to fetch status breakdown",
			error: error.message,
		});
	}
};

// Get Recent Activity
export const getRecentActivity = async (req: Request, res: Response) => {
	try {
		const activities = await ActivityLog.find()
			.sort({ createdAt: -1 })
			.limit(100)
			.populate("performedBy", "name");

		res.status(200).json({
			success: true,
			data: activities,
		});
	} catch (error: any) {
		console.error("❌ Activity error:", error.message);
		res.status(500).json({
			success: false,
			message: "Failed to fetch recent activity",
			error: error.message,
		});
	}
};
