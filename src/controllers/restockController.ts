import { Request, Response } from "express";
import { RestockQueue } from "../models/RestockQueue";
import Product, { IProduct } from "../models/Product";
import { logActivity } from "../utils/activityLogger";

const populateProduct = {
	path: "product",
	select: "name category stock minStockThreshold status",
	populate: {
		path: "category",
		select: "name",
	},
};

// Get Restock Queue Items
export const getRestockQueue = async (req: Request, res: Response) => {
	try {
		const { priority = "", page = 1, limit = 10 } = req.query;

		const filter: any = { isResolved: false };

		if (priority && priority !== "all") {
			filter.priority = priority;
		}

		const allItems = await RestockQueue.find({ isResolved: false });

		// Calculate priority counts
		const priorityCounts = {
			All: allItems.length,
			High: allItems.filter((item) => item.priority === "High").length,
			Medium: allItems.filter((item) => item.priority === "Medium")
				.length,
			Low: allItems.filter((item) => item.priority === "Low").length,
		};

		const pageNum = Math.max(1, parseInt(page as string) || 1);
		const limitNum = Math.max(1, parseInt(limit as string) || 10);
		const skip = (pageNum - 1) * limitNum;

		const total = await RestockQueue.countDocuments(filter);
		const totalPages = Math.ceil(total / limitNum);

		const items = await RestockQueue.find(filter)
			.populate(populateProduct)
			.skip(skip)
			.limit(limitNum)
			.sort({ currentStock: 1 });

		res.status(200).json({
			success: true,
			data: items,
			total,
			page: pageNum,
			totalPages,
			limit: limitNum,
			priorityCounts,
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
		const userId = req.user?._id;

		if (!quantity || typeof quantity !== "number" || quantity <= 0) {
			return res.status(400).json({
				success: false,
				message: "Quantity must be a positive number",
			});
		}

		const queueItem = await RestockQueue.findById(id).populate("product");
		if (!queueItem) {
			return res.status(404).json({
				success: false,
				message: "Restock queue item not found",
			});
		}

		const product = await Product.findById(queueItem.product);
		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found",
			});
		}

		const oldStock = product.stock;
		const productName = product.name;

		product.stock += quantity;
		product.status = product.stock > 0 ? "Active" : "Out of Stock";
		await product.save();

		if (product.stock >= product.minStockThreshold) {
			queueItem.isResolved = true;
			queueItem.resolvedAt = new Date();
		} else {
			queueItem.currentStock = product.stock;

			// 1. Calculate the percentage
			const percentage =
				(product.stock / product.minStockThreshold) * 100;

			let priority: "High" | "Medium" | "Low" = "Low";

			// 2. Define thresholds
			if (product.stock === 0 || percentage <= 30) {
				// Critical: Out of stock OR 25% or less of the minimum needed
				priority = "High";
			} else if (percentage <= 65) {
				// Warning: Between 25% and 75% of the minimum
				priority = "Medium";
			} else {
				// Healthy: Above 75% of the minimum
				priority = "Low";
			}

			queueItem.priority = priority;
		}

		await queueItem.save();

		await logActivity({
			action: "Stock Updated",
			entityType: "RestockQueue",
			entityId: queueItem._id,
			userId,
			description: `Stock updated for '${productName}' (+${quantity} units, ${oldStock} → ${product.stock}) via Restock Queue`,
		});

		const updatedItem =
			await RestockQueue.findById(id).populate(populateProduct);

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
		const userId = req.user?._id;

		const queueItem = await RestockQueue.findByIdAndDelete(id);
		if (!queueItem) {
			return res.status(404).json({
				success: false,
				message: "Restock queue item not found",
			});
		}

		const product = await Product.findById(queueItem.product);
		const productName = product?.name || "Unknown Product";

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
