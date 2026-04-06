import { Router } from "express";
import { register, login, logout, getMe } from "../controllers/authController";
import { requireAuth } from "../middleware/rbacMiddleware";

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post("/register", register);

/**
 * POST /api/auth/login
 * Login user and return JWT token
 */
router.post("/login", login);

/**
 * POST /api/auth/logout
 * Logout user and clear token cookie
 */
router.post("/logout", requireAuth, logout);

/**
 * GET /api/auth/me
 * Get current logged in user (protected route)
 */
router.get("/me", requireAuth, getMe);

export default router;
