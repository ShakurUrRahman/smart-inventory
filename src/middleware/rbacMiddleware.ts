import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";
import Product, { IProduct } from "../models/Product";
import { Types } from "mongoose";

/**
 * MIDDLEWARE 1: requireAuth
 * Reads JWT from cookies, verifies it, fetches full user document from DB
 * Ensures demoted users lose access immediately
 */
export const requireAuth = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		// Read from cookie OR Authorization header
		let token = req.cookies?.token;

		if (!token && req.headers.authorization) {
			const authHeader = req.headers.authorization;
			if (authHeader.startsWith("Bearer ")) {
				token = authHeader.slice(7);
			}
		}

		if (!token) {
			return res.status(401).json({ error: "Unauthorized" });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as {
			userId: string;
		};

		if (!decoded.userId) {
			return res.status(401).json({ error: "Unauthorized" });
		}

		const user = await User.findById(decoded.userId).select(
			"+passwordHash",
		);

		if (!user) {
			return res.status(401).json({ error: "Unauthorized" });
		}

		if (!user.isActive) {
			return res.status(401).json({ error: "Account is deactivated" });
		}

		req.user = user;
		next();
	} catch (error: any) {
		return res.status(401).json({ error: "Unauthorized" });
	}
};

/**
 * MIDDLEWARE 2: requireRole
 * Factory function that returns middleware
 * Checks if req.user.role is in the allowed roles array
 * Usage: requireRole('admin', 'super_admin')
 */
export const requireRole = (...roles: string[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			// Ensure user is authenticated (should be called after requireAuth)
			if (!req.user) {
				return res.status(401).json({
					error: "Unauthorized",
				});
			}

			// Check if user's role is in allowed roles
			if (!roles.includes(req.user.role)) {
				return res.status(403).json({
					error: "Insufficient permissions",
					required: roles,
					current: req.user.role,
				});
			}

			next();
		} catch (error: any) {
			return res.status(403).json({
				error: "Insufficient permissions",
			});
		}
	};
};

/**
 * MIDDLEWARE 3: requireOwnershipOrRole
 * Factory function that returns middleware
 * Checks if user is in allowedRoles OR is the owner of the product
 * Attaches product to req.product
 */
export const requireOwnershipOrRole = (allowedRoles: string[]) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			// Ensure user is authenticated
			if (!req.user) {
				return res.status(401).json({
					error: "Unauthorized",
				});
			}

			// Read :id from params (product ID)
			const productId = req.params.id;

			if (!productId || !Types.ObjectId.isValid(productId)) {
				return res.status(400).json({
					error: "Invalid product ID",
				});
			}

			// Fetch product from DB
			const product = await Product.findById(productId);

			if (!product) {
				return res.status(404).json({
					error: "Product not found",
				});
			}

			// Check if user is in allowed roles
			if (allowedRoles.includes(req.user.role)) {
				req.product = product;
				return next();
			}

			// Check if user is the creator
			if (product.createdBy.toString() === req.user._id.toString()) {
				req.product = product;
				return next();
			}

			// Neither role nor owner
			return res.status(403).json({
				error: "You can only modify your own products",
			});
		} catch (error: any) {
			return res.status(403).json({
				error: "You can only modify your own products",
			});
		}
	};
};

/**
 * MIDDLEWARE 4: requireCategoryPermission
 * Factory function that returns middleware
 * Checks category-level permissions based on role and categoryPermissions
 */
export const requireCategoryPermission = (
	action: "canCreate" | "canUpdate" | "canDelete",
) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			// Ensure user is authenticated
			if (!req.user) {
				return res.status(401).json({
					error: "Unauthorized",
				});
			}

			// Admins and super admins always have access
			if (req.user.role === "admin" || req.user.role === "super_admin") {
				return next();
			}

			// Managers need to check specific permissions
			if (req.user.role === "manager") {
				const hasPermission = req.user.categoryPermissions[action];

				if (hasPermission) {
					return next();
				}

				return res.status(403).json({
					error: "Category permission not granted",
					action: action,
					message: "Request this permission from an admin",
				});
			}

			// Regular users don't have category permissions
			return res.status(403).json({
				error: "Access denied",
			});
		} catch (error: any) {
			return res.status(403).json({
				error: "Access denied",
			});
		}
	};
};

/**
 * MIDDLEWARE 5: cannotTargetSuperAdmin
 * Reads :id from params (target user ID)
 * Prevents modification of super admin accounts
 * Attaches target user to req.targetUser
 */
export const cannotTargetSuperAdmin = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		// Read :id from params (target user ID)
		const userId = req.params.id;

		if (!userId || !Types.ObjectId.isValid(userId)) {
			return res.status(400).json({
				error: "Invalid user ID",
			});
		}

		// Fetch target user from DB
		const targetUser = await User.findById(userId);

		if (!targetUser) {
			return res.status(404).json({
				error: "User not found",
			});
		}

		// Check if target is super admin
		if (targetUser.isSuperAdmin) {
			return res.status(403).json({
				error: "Super admin cannot be modified by anyone",
			});
		}

		// Attach target user to request
		req.targetUser = targetUser;

		next();
	} catch (error: any) {
		return res.status(404).json({
			error: "User not found",
		});
	}
};

/**
 * MIDDLEWARE 6: preventSelfModification
 * Checks if user is trying to modify their own role
 * Prevents users from changing their own role/permissions
 */
export const preventSelfModification = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		// Ensure user is authenticated
		if (!req.user) {
			return res.status(401).json({
				error: "Unauthorized",
			});
		}

		// Read :id from params (target user ID)
		const targetUserId = req.params.id;

		// Check if same user
		if (req.user._id.toString() === targetUserId) {
			return res.status(400).json({
				error: "You cannot modify your own role",
			});
		}

		next();
	} catch (error: any) {
		return res.status(400).json({
			error: "You cannot modify your own role",
		});
	}
};
