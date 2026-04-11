import { Router } from "express";
import {
	getAllProducts,
	createProduct,
	getProductById,
	updateProduct,
	deleteProduct,
	restockProduct,
} from "../controllers/productController";
import {
	requireAuth,
	requireRole,
	requireOwnershipOrRole,
} from "../middleware/rbacMiddleware";

const router = Router();

router.use(requireAuth);

// GET all products
router.get("/", getAllProducts);

// CREATE new product
router.post("/", createProduct);

// UPDATE product - user can update own, admins can update any
router.put(
	"/:id",
	requireOwnershipOrRole(["user", "admin", "manager", "super_admin"]),
	updateProduct,
);

// RESTOCK product - user can restock own, admins can restock any
router.patch(
	"/:id/restock",
	requireOwnershipOrRole(["user", "admin", "manager", "super_admin"]),
	restockProduct,
);

// DELETE product - user can delete own, admins can delete any
router.delete(
	"/:id",
	requireOwnershipOrRole(["user", "admin", "manager", "super_admin"]),
	deleteProduct,
);

export default router;
