import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// This file is not using, rbacMiddleware cover all middleware functionality

declare global {
	namespace Express {
		interface Request {
			user?: {
				userId: string;
				role: string;
			};
		}
	}
}

interface JwtPayload {
	userId: string;
	role: string;
	iat: number;
	exp: number;
}

/**
 * Middleware to verify JWT token from cookies or Authorization header
 * Sets req.user with decoded token data
 */
export const authMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	try {
		let token: string | undefined;

		// Try to get token from cookies first
		token = req.cookies?.token;

		// If not in cookies, check Authorization header
		if (!token && req.headers.authorization) {
			const authHeader = req.headers.authorization;
			if (authHeader.startsWith("Bearer ")) {
				token = authHeader.slice(7); // Remove "Bearer " prefix
			}
		}

		// If no token found, return 401
		if (!token) {
			res.status(401).json({
				success: false,
				message: "Unauthorized - No token provided",
			});
			return;
		}

		// Verify token
		const decoded = jwt.verify(
			token,
			process.env.JWT_SECRET || "your-secret-key",
		) as JwtPayload;

		// Attach user info to request
		req.user = {
			userId: decoded.userId,
			role: decoded.role,
		};

		next();
	} catch (error: any) {
		// Handle specific JWT errors
		if (error.name === "TokenExpiredError") {
			res.status(401).json({
				success: false,
				message: "Unauthorized - Token expired",
			});
			return;
		}

		if (error.name === "JsonWebTokenError") {
			res.status(401).json({
				success: false,
				message: "Unauthorized - Invalid token",
			});
			return;
		}

		res.status(401).json({
			success: false,
			message: "Unauthorized",
		});
	}
};

/**
 * Middleware to check if user has specific role
 * Usage: app.get("/admin-only", authMiddleware, roleMiddleware(["admin"]), handler)
 */
export const roleMiddleware = (allowedRoles: string[]) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		if (!req.user) {
			res.status(401).json({
				success: false,
				message: "Unauthorized",
			});
			return;
		}

		if (!allowedRoles.includes(req.user.role)) {
			res.status(403).json({
				success: false,
				message: "Forbidden - Insufficient permissions",
			});
			return;
		}

		next();
	};
};
