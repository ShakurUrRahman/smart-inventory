import { Router } from "express";
import {
	getAllUsers,
	promoteToManager,
	promoteToAdmin,
	demoteAdminToManager,
	demoteManagerToUser,
	updateCategoryPermissions,
	getPendingProducts,
	approveProduct,
	rejectProduct,
} from "../controllers/adminController";
import {
	requireAuth,
	requireRole,
	cannotTargetSuperAdmin,
	preventSelfModification,
} from "../middleware/rbacMiddleware";

const router = Router();

// ─── User Management ──────────────────────────────────────────────────────────

// GET /api/admin/users — list all users
router.get(
	"/users",
	requireAuth,
	requireRole("admin", "super_admin"),
	getAllUsers,
);

// PATCH /api/admin/users/:id/promote-manager — user → manager
router.patch(
	"/users/:id/promote-manager",
	requireAuth,
	requireRole("admin", "super_admin"),
	preventSelfModification,
	cannotTargetSuperAdmin,
	promoteToManager,
);

// PATCH /api/admin/users/:id/promote-admin — manager → admin (super_admin only)
router.patch(
	"/users/:id/promote-admin",
	requireAuth,
	requireRole("super_admin"),
	preventSelfModification,
	cannotTargetSuperAdmin,
	promoteToAdmin,
);

// PATCH /api/admin/users/:id/demote-manager — admin → manager (super_admin only)
router.patch(
	"/users/:id/demote-manager",
	requireAuth,
	requireRole("super_admin"),
	preventSelfModification,
	cannotTargetSuperAdmin,
	demoteAdminToManager,
);

// PATCH /api/admin/users/:id/demote-user — manager → user
router.patch(
	"/users/:id/demote-user",
	requireAuth,
	requireRole("admin", "super_admin"),
	preventSelfModification,
	cannotTargetSuperAdmin,
	demoteManagerToUser,
);

// PATCH /api/admin/users/:id/category-permissions — toggle manager permissions
router.patch(
	"/users/:id/category-permissions",
	requireAuth,
	requireRole("admin", "super_admin"),
	cannotTargetSuperAdmin,
	updateCategoryPermissions,
);

// ─── Product Approval ─────────────────────────────────────────────────────────

// GET /api/admin/products/pending — list pending products
router.get(
	"/products/pending",
	requireAuth,
	requireRole("admin", "super_admin", "manager"),
	getPendingProducts,
);

// PATCH /api/admin/products/:id/approve — approve product
router.patch(
	"/products/:id/approve",
	requireAuth,
	requireRole("admin", "super_admin", "manager"),
	approveProduct,
);

// PATCH /api/admin/products/:id/reject — reject product
router.patch(
	"/products/:id/reject",
	requireAuth,
	requireRole("admin", "super_admin", "manager"),
	rejectProduct,
);

export default router;
