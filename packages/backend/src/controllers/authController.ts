import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User";
import { logActivity } from "../utils/activityLogger";

// Extend Express Request to include user
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

/**
 * Register a new user
 * @route POST /api/auth/register
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 */
export const register = async (req: Request, res: Response): Promise<void> => {
	try {
		const { name, email, password, role } = req.body;

		// Validation
		if (!name || !email || !password) {
			res.status(400).json({
				success: false,
				message: "Name, email, and password are required",
			});
			return;
		}

		if (password.length < 6) {
			res.status(400).json({
				success: false,
				message: "Password must be at least 6 characters long",
			});
			return;
		}

		// Check if email already exists
		const existingUser = await User.findOne({ email: email.toLowerCase() });
		if (existingUser) {
			res.status(400).json({
				success: false,
				message: "Email already in use",
			});
			return;
		}

		// Hash password
		const salt = await bcrypt.genSalt(10);
		const passwordHash = await bcrypt.hash(password, salt);

		// Create user
		const newUser = await User.create({
			name,
			email: email.toLowerCase(),
			passwordHash,
			role: role || "manager",
		});

		// Log activity
		await logActivity({
			action: "User Registered",
			entityType: "User",
			entityId: newUser._id,
			userId: newUser._id,
		});

		res.status(201).json({
			success: true,
			message: "Account created successfully",
			user: {
				id: newUser._id,
				name: newUser.name,
				email: newUser.email,
				role: newUser.role,
			},
		});
	} catch (error) {
		console.error("Register error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

/**
 * Login user
 * @route POST /api/auth/login
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 */
export const login = async (req: Request, res: Response): Promise<void> => {
	try {
		const { email, password } = req.body;

		// Validation
		if (!email || !password) {
			res.status(400).json({
				success: false,
				message: "Email and password are required",
			});
			return;
		}

		// Find user
		const user = await User.findOne({ email: email.toLowerCase() }).select(
			"+passwordHash",
		);
		if (!user) {
			res.status(401).json({
				success: false,
				message: "Invalid credentials",
			});
			return;
		}

		// Compare password
		const isPasswordValid = await bcrypt.compare(
			password,
			user.passwordHash,
		);
		if (!isPasswordValid) {
			res.status(401).json({
				success: false,
				message: "Invalid credentials",
			});
			return;
		}

		// Generate JWT
		const token = jwt.sign(
			{ userId: user._id, role: user.role },
			process.env.JWT_SECRET || "your-secret-key",
			{
				expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as "7d",
			},
		);

		// Set cookie
		const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
		res.cookie("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production", // false in dev, true in prod
			sameSite: "lax",
			maxAge,
		});

		// Log activity
		await logActivity({
			action: "User Logged In",
			entityType: "User",
			entityId: user._id,
			userId: user._id,
		});

		res.status(200).json({
			success: true,
			message: "Logged in successfully",
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
		});
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

/**
 * Logout user
 * @route POST /api/auth/logout
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
	try {
		// Log activity
		if (req.user?.userId) {
			await logActivity({
				action: "User Logged Out",
				entityType: "User",
				entityId: req.user.userId,
				userId: req.user.userId,
			});
		}

		// Clear cookie
		res.clearCookie("token", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
		});

		res.status(200).json({
			success: true,
			message: "Logged out successfully",
		});
	} catch (error) {
		console.error("Logout error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

/**
 * Get current logged in user
 * @route GET /api/auth/me
 * @param {Request} req - Express request (should have req.user from middleware)
 * @param {Response} res - Express response
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
	try {
		if (!req.user?.userId) {
			res.status(401).json({
				success: false,
				message: "Unauthorized",
			});
			return;
		}

		const user = await User.findById(req.user.userId);
		if (!user) {
			res.status(404).json({
				success: false,
				message: "User not found",
			});
			return;
		}

		res.status(200).json({
			success: true,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				createdAt: user.createdAt,
			},
		});
	} catch (error) {
		console.error("GetMe error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};
