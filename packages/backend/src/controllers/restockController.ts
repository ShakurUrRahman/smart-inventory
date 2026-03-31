import { Request, Response } from "express";
import { RestockQueue } from "../models/RestockQueue";
import { Product } from "../models/Product";
import { logActivity } from "../utils/activityLogger";
import { handleRestockCheck } from "../utils/restockHandler";

// Get Restock Queue Items
export const getRestockQueue = async (req: Request, res: Response) => {
	try {
		const { priority = "", page = 1, limit = 10 } = req.query;

		const filter: any = {
			isResolved: false,
		};

		// Priority filter
		if (priority && priority !== "all") {
			filter.priority = priority;
		}

		// Pagination
		const pageNum = Math.max(1, parseInt(page as string) || 1);
		const limitNum = Math.max(1, parseInt(limit as string) || 10);
		const skip = (pageNum - 1) * limitNum;

		// Get total count
		const total = await RestockQueue.countDocuments(filter);
		const totalPages = Math.ceil(total / limitNum);

		// Fetch queue items sorted by stock (lowest first = highest urgency)
		const items = await RestockQueue.find(filter)
			.populate("product", "name category stock minStockThreshold status")
			.skip(skip)
			.limit(limitNum)
			.sort({ currentStock: 1 }); // Lowest stock first

		res.status(200).json({
			success: true,
			data: items,
			total,
			page: pageNum,
			totalPages,
			limit: limitNum,
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: "Failed to fetch restock queue",
			error: error.message,
		});
	}
};

// Resolve Restock Item (add stock)
export const resolveRestockItem = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { quantity } = req.body;
		const userId = req.user?.userId;

		// Validate quantity
		if (!quantity || typeof quantity !== "number" || quantity <= 0) {
			return res.status(400).json({
				success: false,
				message: "Quantity must be a positive number",
			});
		}

		// Find restock queue item
		const queueItem = await RestockQueue.findById(id).populate("product");
		if (!queueItem) {
			return res.status(404).json({
				success: false,
				message: "Restock queue item not found",
			});
		}

		// Get product
		const product = await Product.findById(queueItem.product);
		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found",
			});
		}

		const oldStock = product.stock;
		const productName = product.name;

		// Add stock
		product.stock += quantity;

		// Update status
		if (product.stock > 0) {
			product.status = "Active";
		}

		await product.save();

		// Update or resolve queue item
		if (product.stock >= product.minStockThreshold) {
			// Mark as resolved
			queueItem.isResolved = true;
			queueItem.resolvedAt = new Date();
		} else {
			// Update current stock and re-evaluate priority
			queueItem.currentStock = product.stock;

			let priority: "High" | "Medium" | "Low" = "Low";
			if (product.stock === 0) {
				priority = "High";
			} else if (product.stock <= product.minStockThreshold / 2) {
				priority = "Medium";
			}
			queueItem.priority = priority;
		}

		await queueItem.save();

		// Log activity
		await logActivity({
			action: "Stock Updated",
			entityType: "RestockQueue",
			entityId: queueItem._id,
			userId,
			description: `Stock updated for '${productName}' (+${quantity} units, ${oldStock} → ${product.stock}) via Restock Queue`,
		});

		// Populate and return
		const updatedItem = await RestockQueue.findById(id).populate(
			"product",
			"name category stock minStockThreshold status",
		);

		res.status(200).json({
			success: true,
			message: "Stock updated successfully",
			data: {
				queueItem: updatedItem,
				product,
			},
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: "Failed to resolve restock item",
			error: error.message,
		});
	}
};

// Remove from Queue (admin override)
export const removeFromQueue = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const userId = req.user?.userId;

		// Find and delete queue item
		const queueItem = await RestockQueue.findByIdAndDelete(id);
		if (!queueItem) {
			return res.status(404).json({
				success: false,
				message: "Restock queue item not found",
			});
		}

		// Get product name for logging
		const product = await Product.findById(queueItem.product);
		const productName = product?.name || "Unknown Product";

		// Log activity
		await logActivity({
			action: "Queue Item Removed",
			entityType: "RestockQueue",
			entityId: id,
			userId,
			description: `Product '${productName}' removed from Restock Queue manually`,
		});

		res.status(200).json({
			success: true,
			message: "Item removed from queue",
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: "Failed to remove queue item",
			error: error.message,
		});
	}
};
