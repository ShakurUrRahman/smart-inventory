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

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", createProduct);
router.put(
	"/:id",
	requireOwnershipOrRole(["admin", "manager", "super_admin"]),
	updateProduct,
);
router.patch(
	"/:id/restock",
	requireRole("admin", "manager", "super_admin"),
	restockProduct,
);
router.delete(
	"/:id",
	requireOwnershipOrRole(["admin", "manager", "super_admin"]),
	deleteProduct,
);

export default router;
