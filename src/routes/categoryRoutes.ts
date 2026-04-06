import { Router } from "express";
import {
	getAllCategories,
	createCategory,
	getCategoryById,
	updateCategory,
	deleteCategory,
} from "../controllers/categoryController";
import {
	requireAuth,
	requireCategoryPermission,
} from "../middleware/rbacMiddleware";

const router = Router();

router.use(requireAuth);

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.post("/", requireCategoryPermission("canCreate"), createCategory);
router.put("/:id", requireCategoryPermission("canUpdate"), updateCategory);
router.delete("/:id", requireCategoryPermission("canDelete"), deleteCategory);

export default router;
