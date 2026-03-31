import { Router } from "express";
import {
	getAllCategories,
	createCategory,
	getCategoryById,
	updateCategory,
	deleteCategory,
} from "../controllers/categoryController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.post("/", createCategory);
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
