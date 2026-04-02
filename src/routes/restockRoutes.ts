import { Router } from "express";
import {
	getRestockQueue,
	resolveRestockItem,
	removeFromQueue,
} from "../controllers/restockController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get("/", getRestockQueue);
router.patch("/:id/resolve", resolveRestockItem);
router.delete("/:id", removeFromQueue);

export default router;
