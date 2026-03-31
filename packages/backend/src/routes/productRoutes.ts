import { Router } from "express";
import {
	getAllProducts,
	createProduct,
	getProductById,
	updateProduct,
	deleteProduct,
	restockProduct,
} from "../controllers/productController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.post("/", createProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.patch("/:id/restock", restockProduct);
router.delete("/:id", deleteProduct);

export default router;
