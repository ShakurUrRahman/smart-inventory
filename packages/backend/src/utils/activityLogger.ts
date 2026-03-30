import { ActivityLog, IActivityLog } from "../models/ActivityLog";
import { Types } from "mongoose";

interface LogActivityParams {
	action: string;
	entityType: "Order" | "Product" | "Stock" | "User" | "Category";
	entityId?: Types.ObjectId | string;
	userId?: Types.ObjectId | string;
}

/**
 * Log an activity to the database
 * Fails silently if there's an error
 * @param action - Description of the action (e.g., "Created", "Updated", "Deleted")
 * @param entityType - Type of entity affected
 * @param entityId - ID of the entity (optional)
 * @param userId - ID of the user who performed the action (optional)
 */
export const logActivity = async ({
	action,
	entityType,
	entityId,
	userId,
}: LogActivityParams): Promise<void> => {
	try {
		const activityData: Partial<IActivityLog> = {
			action,
			entityType,
		};

		// Add optional fields if provided
		if (entityId) {
			activityData.entityId = new Types.ObjectId(entityId);
		}
		if (userId) {
			activityData.performedBy = new Types.ObjectId(userId);
		}

		// Create activity log document
		await ActivityLog.create(activityData);
	} catch (error) {
		// Silently fail - logging errors should not break the main application
		console.error("Activity logging failed:", error);
	}
};

/**
 * Batch log multiple activities
 * @param activities - Array of activities to log
 */
export const logActivitiesBatch = async (
	activities: LogActivityParams[],
): Promise<void> => {
	try {
		const activityDataArray = activities.map((activity) => {
			const data: Partial<IActivityLog> = {
				action: activity.action,
				entityType: activity.entityType,
			};

			if (activity.entityId) {
				data.entityId = new Types.ObjectId(activity.entityId);
			}
			if (activity.userId) {
				data.performedBy = new Types.ObjectId(activity.userId);
			}

			return data;
		});

		await ActivityLog.insertMany(activityDataArray);
	} catch (error) {
		console.error("Batch activity logging failed:", error);
	}
};

/**
 * Get activities for a specific entity
 * @param entityId - ID of the entity
 * @param limit - Number of activities to retrieve
 */
export const getActivityLog = async (
	entityId: Types.ObjectId | string,
	limit: number = 10,
): Promise<IActivityLog[]> => {
	try {
		return await ActivityLog.find({
			entityId: new Types.ObjectId(entityId),
		})
			.limit(limit)
			.sort({ createdAt: -1 })
			.populate("performedBy", "name email");
	} catch (error) {
		console.error("Failed to retrieve activity log:", error);
		return [];
	}
};

/**
 * Get recent activities
 * @param limit - Number of activities to retrieve
 */
export const getRecentActivities = async (
	limit: number = 20,
): Promise<IActivityLog[]> => {
	try {
		return await ActivityLog.find()
			.limit(limit)
			.sort({ createdAt: -1 })
			.populate("performedBy", "name email");
	} catch (error) {
		console.error("Failed to retrieve recent activities:", error);
		return [];
	}
};
