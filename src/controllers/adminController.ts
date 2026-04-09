/// <reference path="../types/express.d.ts" />
import { Request, Response } from "express";
import User from "../models/User";
import Product from "../models/Product";
import { logActivity } from "../utils/activityLogger";

/*
  PROMOTION / DEMOTION RULES — Source of truth
  ─────────────────────────────────────────────
  ACTION                  | admin | super_admin
  ──────────────────────────────────────────────
  Promote user → manager  |  ✅   |     ✅
  Promote manager → admin |  ❌   |     ✅  ← super_admin only
  Demote admin → manager  |  ❌   |     ✅  ← super_admin only
  Demote manager → user   |  ✅   |     ✅
  Modify super_admin      |  ❌   |     ❌  ← nobody
  Modify self             |  ❌   |     ❌  ← nobody
*/

// ─── Helper: role weight for sorting ─────────────────────────────────────────
const ROLE_WEIGHT: Record<string, number> = {
	super_admin: 4,
	admin: 3,
	manager: 2,
	user: 1,
};

// ─────────────────────────────────────────────────────────────────────────────
// USER MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/users
 * Query: ?role=&search=&page=1&limit=10
 */
export const getAllUsers = async (req: Request, res: Response) => {
	try {
		const { role = "", search = "", page = 1, limit = 10 } = req.query;

		const pageNum = Math.max(1, parseInt(page as string) || 1);
		const limitNum = Math.max(1, parseInt(limit as string) || 10);
		const skip = (pageNum - 1) * limitNum;

		// Build match filter
		const match: any = {};
		if (role) match.role = role;
		if (search) {
			match.$or = [
				{ name: { $regex: search, $options: "i" } },
				{ email: { $regex: search, $options: "i" } },
			];
		}

		const aggregation = await User.aggregate([
			{ $match: match },
			{
				$addFields: {
					roleWeight: {
						$switch: {
							branches: [
								{
									case: { $eq: ["$role", "super_admin"] },
									then: 4,
								},
								{ case: { $eq: ["$role", "admin"] }, then: 3 },
								{
									case: { $eq: ["$role", "manager"] },
									then: 2,
								},
								{ case: { $eq: ["$role", "user"] }, then: 1 },
							],
							default: 0,
						},
					},
					// Slice roleHistory to last 3 entries
					roleHistory: { $slice: ["$roleHistory", -3] },
				},
			},
			{ $sort: { roleWeight: -1, createdAt: -1 } },
			{
				$facet: {
					users: [
						{ $skip: skip },
						{ $limit: limitNum },
						{
							$project: {
								passwordHash: 0,
								__v: 0,
								roleWeight: 0,
							},
						},
					],
					total: [{ $count: "count" }],
				},
			},
		]);

		const users = aggregation[0]?.users || [];
		const total = aggregation[0]?.total[0]?.count || 0;
		const totalPages = Math.ceil(total / limitNum);

		// Populate changedBy in roleHistory
		await User.populate(users, {
			path: "roleHistory.changedBy",
			select: "name email",
		});

		res.status(200).json({
			success: true,
			users,
			total,
			page: pageNum,
			totalPages,
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: "Failed to fetch users",
			error: error.message,
		});
	}
};

/**
 * PATCH /api/admin/users/:id/promote-manager
 * Promote user → manager
 */
export const promoteToManager = async (req: Request, res: Response) => {
	try {
		const targetUser = (req as any).targetUser;
		const requestingUser = req.user as any;

		if (targetUser.role !== "user") {
			return res.status(400).json({
				success: false,
				message: "User must have role 'user' to be promoted to manager",
			});
		}

		const updated = await User.findByIdAndUpdate(
			targetUser._id,
			{
				role: "manager",
				categoryPermissions: {
					canCreate: false,
					canUpdate: false,
					canDelete: false,
				},
				$push: {
					roleHistory: {
						fromRole: "user",
						toRole: "manager",
						changedBy: requestingUser._id,
					},
				},
			},
			{ new: true, select: "-passwordHash -__v" },
		);

		await logActivity({
			action: "User Promoted to Manager",
			entityType: "User",
			entityId: targetUser._id,
			userId: requestingUser._id,
			description: `User '${targetUser.name}' promoted to Manager by ${requestingUser.name}`,
		});

		res.status(200).json({
			success: true,
			message: `${targetUser.name} promoted to Manager`,
			data: updated,
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: "Failed to promote user",
			error: error.message,
		});
	}
};

/**
 * PATCH /api/admin/users/:id/promote-admin
 * Promote manager → admin (super_admin only)
 */
export const promoteToAdmin = async (req: Request, res: Response) => {
	try {
		const targetUser = (req as any).targetUser;
		const requestingUser = req.user as any;

		// Extra check — middleware requireRole('super_admin') handles this
		// but double-check here for safety
		if (requestingUser.role !== "super_admin") {
			return res.status(403).json({
				success: false,
				message: "Only super admin can promote a manager to admin",
			});
		}

		if (targetUser.role !== "manager") {
			return res.status(400).json({
				success: false,
				message:
					"Target user must have role 'manager' to be promoted to admin",
			});
		}

		const updated = await User.findByIdAndUpdate(
			targetUser._id,
			{
				role: "admin",
				$push: {
					roleHistory: {
						fromRole: "manager",
						toRole: "admin",
						changedBy: requestingUser._id,
					},
				},
			},
			{ new: true, select: "-passwordHash -__v" },
		);

		await logActivity({
			action: "Manager Promoted to Admin",
			entityType: "User",
			entityId: targetUser._id,
			userId: requestingUser._id,
			description: `Manager '${targetUser.name}' promoted to Admin by ${requestingUser.name}`,
		});

		res.status(200).json({
			success: true,
			message: `${targetUser.name} promoted to Admin`,
			data: updated,
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: "Failed to promote to admin",
			error: error.message,
		});
	}
};

/**
 * PATCH /api/admin/users/:id/demote-manager
 * Demote admin → manager (super_admin only)
 */
export const demoteAdminToManager = async (req: Request, res: Response) => {
	try {
		const targetUser = (req as any).targetUser;
		const requestingUser = req.user as any;

		if (requestingUser.role !== "super_admin") {
			return res.status(403).json({
				success: false,
				message: "Only super admin can demote an admin",
			});
		}

		if (targetUser.role !== "admin") {
			return res.status(400).json({
				success: false,
				message: "Target user is not an admin",
			});
		}

		const updated = await User.findByIdAndUpdate(
			targetUser._id,
			{
				role: "manager",
				categoryPermissions: {
					canCreate: false,
					canUpdate: false,
					canDelete: false,
				},
				$push: {
					roleHistory: {
						fromRole: "admin",
						toRole: "manager",
						changedBy: requestingUser._id,
					},
				},
			},
			{ new: true, select: "-passwordHash -__v" },
		);

		await logActivity({
			action: "Admin Demoted to Manager",
			entityType: "User",
			entityId: targetUser._id,
			userId: requestingUser._id,
			description: `Admin '${targetUser.name}' demoted to Manager by Super Admin`,
		});

		res.status(200).json({
			success: true,
			message: `${targetUser.name} demoted to Manager`,
			data: updated,
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: "Failed to demote admin",
			error: error.message,
		});
	}
};

/**
 * PATCH /api/admin/users/:id/demote-user
 * Demote manager → user
 */
export const demoteManagerToUser = async (req: Request, res: Response) => {
	try {
		const targetUser = (req as any).targetUser;
		const requestingUser = req.user as any;

		if (targetUser.role !== "manager") {
			return res.status(400).json({
				success: false,
				message: "Can only demote a manager to user",
			});
		}

		// Admin cannot demote another admin — only super_admin can
		if (requestingUser.role === "admin" && targetUser.role !== "manager") {
			return res.status(403).json({
				success: false,
				message: "Admins can only demote managers to user",
			});
		}

		const updated = await User.findByIdAndUpdate(
			targetUser._id,
			{
				role: "user",
				$push: {
					roleHistory: {
						fromRole: "manager",
						toRole: "user",
						changedBy: requestingUser._id,
					},
				},
			},
			{ new: true, select: "-passwordHash -__v" },
		);

		await logActivity({
			action: "Manager Demoted to User",
			entityType: "User",
			entityId: targetUser._id,
			userId: requestingUser._id,
			description: `Manager '${targetUser.name}' demoted to User by ${requestingUser.name}`,
		});

		res.status(200).json({
			success: true,
			message: `${targetUser.name} demoted to User`,
			data: updated,
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: "Failed to demote manager",
			error: error.message,
		});
	}
};

/**
 * PATCH /api/admin/users/:id/category-permissions
 * Toggle individual category permissions for a manager
 */
export const updateCategoryPermissions = async (
	req: Request,
	res: Response,
) => {
	try {
		const targetUser = (req as any).targetUser;
		const requestingUser = req.user as any;

		const { canCreate, canUpdate, canDelete } = req.body;

		// ─── 1. AUTHORIZATION CHECK ─────────────────────────────

		// Only admin & super_admin can update permissions
		if (!["admin", "super_admin"].includes(requestingUser.role)) {
			return res.status(403).json({
				success: false,
				message: "Only admin or super admin can update permissions",
			});
		}

		// Only managers have category permissions
		if (targetUser.role !== "manager") {
			return res.status(400).json({
				success: false,
				message: "Category permissions only apply to managers",
			});
		}

		// ─── 2. VALIDATION ─────────────────────────────────────

		const updates: Record<string, boolean> = {};

		const validateBoolean = (value: any, field: string) => {
			if (typeof value !== "boolean") {
				throw new Error(`${field} must be a boolean`);
			}
		};

		if (canCreate !== undefined) {
			validateBoolean(canCreate, "canCreate");
			updates["categoryPermissions.canCreate"] = canCreate;
		}

		if (canUpdate !== undefined) {
			validateBoolean(canUpdate, "canUpdate");
			updates["categoryPermissions.canUpdate"] = canUpdate;
		}

		if (canDelete !== undefined) {
			validateBoolean(canDelete, "canDelete");
			updates["categoryPermissions.canDelete"] = canDelete;
		}

		if (Object.keys(updates).length === 0) {
			return res.status(400).json({
				success: false,
				message: "No valid permission fields provided",
			});
		}

		// ─── 3. UPDATE ─────────────────────────────────────────

		const updated = await User.findByIdAndUpdate(
			targetUser._id,
			{ $set: updates },
			{ new: true, select: "categoryPermissions" },
		);

		// ─── 4. ACTIVITY LOG ───────────────────────────────────

		await logActivity({
			action: "Category Permissions Updated",
			entityType: "User",
			entityId: targetUser._id,
			userId: requestingUser._id,
			description: `Category permissions updated for '${targetUser.name}' by ${requestingUser.name}`,
		});

		// ─── 5. RESPONSE ───────────────────────────────────────

		res.status(200).json({
			success: true,
			message: `Permissions updated for ${targetUser.name}`,
			categoryPermissions: updated?.categoryPermissions,
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: error.message || "Failed to update permissions",
		});
	}
};

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT APPROVAL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/products/pending
 * Get all products awaiting approval
 */
export const getPendingProducts = async (req: Request, res: Response) => {
	try {
		const products = await Product.find({ approvalStatus: "pending" })
			.populate("createdBy", "name email role")
			.populate("category", "name")
			.sort({ createdAt: 1 }); // oldest first

		res.status(200).json({
			success: true,
			total: products.length,
			data: products,
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: "Failed to fetch pending products",
			error: error.message,
		});
	}
};

/**
 * PATCH /api/admin/products/:id/approve
 * Approve a pending product
 */
export const approveProduct = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const requestingUser = req.user as any;

		const product = await Product.findById(id);
		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found",
			});
		}

		if (product.approvalStatus !== "pending") {
			return res.status(400).json({
				success: false,
				message: "Product is not in pending state",
			});
		}

		product.approvalStatus = "approved";
		product.approvedBy = requestingUser._id;
		product.approvedAt = new Date();

		// Set product to active once approved
		product.status = product.stock === 0 ? "Out of Stock" : "Active";

		await product.save();

		await logActivity({
			action: "Product Approved",
			entityType: "Product",
			entityId: product._id,
			userId: requestingUser._id,
			description: `Product '${product.name}' approved by ${requestingUser.name}`,
		});

		const updated = await Product.findById(id)
			.populate("createdBy", "name email role")
			.populate("category", "name")
			.populate("approvedBy", "name");

		res.status(200).json({
			success: true,
			message: `Product '${product.name}' approved`,
			data: updated,
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: "Failed to approve product",
			error: error.message,
		});
	}
};

/**
 * PATCH /api/admin/products/:id/reject
 * Reject a pending product
 */
export const rejectProduct = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { reason } = req.body;
		const requestingUser = req.user as any;

		// Validate reason
		if (!reason || typeof reason !== "string") {
			return res.status(400).json({
				success: false,
				message: "Rejection reason is required",
			});
		}

		if (reason.trim().length < 10) {
			return res.status(400).json({
				success: false,
				message: "Rejection reason must be at least 10 characters",
			});
		}

		const product = await Product.findById(id);
		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found",
			});
		}

		if (product.approvalStatus !== "pending") {
			return res.status(400).json({
				success: false,
				message: "Product is not in pending state",
			});
		}

		product.approvalStatus = "rejected";
		product.rejectedBy = requestingUser._id;
		product.rejectedAt = new Date();
		product.rejectionReason = reason.trim();

		await product.save();

		await logActivity({
			action: "Product Rejected",
			entityType: "Product",
			entityId: product._id,
			userId: requestingUser._id,
			description: `Product '${product.name}' rejected — Reason: ${reason.trim()}`,
		});

		const updated = await Product.findById(id)
			.populate("createdBy", "name email role")
			.populate("category", "name")
			.populate("rejectedBy", "name");

		res.status(200).json({
			success: true,
			message: `Product '${product.name}' rejected`,
			data: updated,
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: "Failed to reject product",
			error: error.message,
		});
	}
};
