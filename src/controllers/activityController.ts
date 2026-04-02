import { Request, Response } from "express";
import { ActivityLog } from "../models/ActivityLog";

export const getActivityLogs = async (req: Request, res: Response) => {
	try {
		const { entityType = "", page = 1, limit = 10 } = req.query;

		const filter: any = {};

		// Entity type filter
		if (entityType && entityType !== "all") {
			filter.entityType = entityType;
		}

		// Pagination
		const pageNum = Math.max(1, parseInt(page as string) || 1);
		const limitNum = Math.max(1, parseInt(limit as string) || 10);
		const skip = (pageNum - 1) * limitNum;

		// Get total count
		const total = await ActivityLog.countDocuments(filter);
		const totalPages = Math.ceil(total / limitNum);

		// Fetch logs sorted by newest first
		const logs = await ActivityLog.find(filter)
			.populate("performedBy", "name")
			.skip(skip)
			.limit(limitNum)
			.sort({ createdAt: -1 });

		res.status(200).json({
			success: true,
			data: logs,
			total,
			page: pageNum,
			totalPages,
			limit: limitNum,
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: "Failed to fetch activity logs",
			error: error.message,
		});
	}
};
