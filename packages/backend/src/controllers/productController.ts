import { Request, Response } from "express";
import { Product } from "../models/Product";
import { Category } from "../models/Category";
import { RestockQueue } from "../models/RestockQueue";
import { Order } from "../models/Order";
import { logActivity } from "../utils/activityLogger";

// Get All Products with Filters & Pagination
export const getAllProducts = async (req: Request, res: Response) => {
	try {
		const {
			search = "",
			category = "",
			status = "",
			page = 1,
			limit = 10,
		} = req.query;

		// Build filter object
		const filter: any = {};

		// Search filter (case-insensitive)
		if (search) {
			filter.name = { $regex: search, $options: "i" };
		}

		// Category filter
		if (category && category !== "all") {
			filter.category = category;
		}

		// Status filter
		if (status && status !== "all") {
			filter.status = status;
		}

		// Pagination
		const pageNum = Math.max(1, parseInt(page as string) || 1);
		const limitNum = Math.max(1, parseInt(limit as string) || 10);
		const skip = (pageNum - 1) * limitNum;

		// Get total count for pagination
		const total = await Product.countDocuments(filter);
		const totalPages = Math.ceil(total / limitNum);

		// Fetch products with pagination and populate category
		const products = await Product.find(filter)
			.populate("category", "name")
			.skip(skip)
			.limit(limitNum)
			.sort({ createdAt: -1 });

		res.status(200).json({
			success: true,
			data: products,
			total,
			page: pageNum,
			totalPages,
			limit: limitNum,
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: "Failed to fetch products",
			error: error.message,
		});
	}
};

// Create Product
export const createProduct = async (req: Request, res: Response) => {
	try {
		const { name, category, price, stock, minStockThreshold } = req.body;
		const userId = req.user?.userId;

		// Validation
		if (
			!name ||
			!category ||
			price === undefined ||
			stock === undefined ||
			!minStockThreshold
		) {
			return res.status(400).json({
				success: false,
				message: "All fields are required",
			});
		}

		if (typeof price !== "number" || price < 0) {
			return res.status(400).json({
				success: false,
				message: "Price must be a positive number",
			});
		}

		if (typeof stock !== "number" || stock < 0) {
			return res.status(400).json({
				success: false,
				message: "Stock must be a non-negative number",
			});
		}

		if (typeof minStockThreshold !== "number" || minStockThreshold < 1) {
			return res.status(400).json({
				success: false,
				message: "Minimum stock threshold must be at least 1",
			});
		}

		// Verify category exists
		const categoryExists = await Category.findById(category);
		if (!categoryExists) {
			return res.status(400).json({
				success: false,
				message: "Category does not exist",
			});
		}

		// Determine status based on stock
		const status = stock === 0 ? "Out of Stock" : "Active";

		// Create product
		const product = await Product.create({
			name,
			category,
			price,
			stock,
			minStockThreshold,
			status,
			createdBy: userId,
		});

		// Add to restock queue if stock is low
		if (stock < minStockThreshold && stock > 0) {
			// Determine priority
			let priority: "High" | "Medium" | "Low" = "Low";
			if (stock === 0) {
				priority = "High";
			} else if (stock <= minStockThreshold / 2) {
				priority = "Medium";
			}

			await RestockQueue.create({
				product: product._id,
				currentStock: stock,
				requiredStock: minStockThreshold,
				priority,
				requestedAt: new Date(),
			});
		}

		// Log activity
		await logActivity({
			action: "Product Created",
			entityType: "Product",
			entityId: product._id,
			userId,
			description: `Product '${name}' added`,
		});

		const populatedProduct = await Product.findById(product._id).populate(
			"category",
			"name",
		);

		res.status(201).json({
			success: true,
			message: "Product created successfully",
			data: populatedProduct,
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: "Failed to create product",
			error: error.message,
		});
	}
};

// Update Product
export const updateProduct = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const userId = req.user?.userId;
		const { name, category, price, minStockThreshold } = req.body;

		// Find product
		const product = await Product.findById(id);
		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found",
			});
		}

		// Validate allowed fields
		if (price !== undefined) {
			if (typeof price !== "number" || price < 0) {
				return res.status(400).json({
					success: false,
					message: "Price must be a positive number",
				});
			}
			product.price = price;
		}

		if (minStockThreshold !== undefined) {
			if (
				typeof minStockThreshold !== "number" ||
				minStockThreshold < 1
			) {
				return res.status(400).json({
					success: false,
					message: "Minimum stock threshold must be at least 1",
				});
			}
			product.minStockThreshold = minStockThreshold;
		}

		if (category !== undefined) {
			// Verify category exists
			const categoryExists = await Category.findById(category);
			if (!categoryExists) {
				return res.status(400).json({
					success: false,
					message: "Category does not exist",
				});
			}
			product.category = category;
		}

		if (name !== undefined) {
			product.name = name;
		}

		// Re-evaluate status
		product.status = product.stock === 0 ? "Out of Stock" : "Active";

		await product.save();

		// Log activity
		await logActivity({
			action: "Product Updated",
			entityType: "Product",
			entityId: product._id,
			userId,
			description: `Product '${product.name}' updated`,
		});

		const updatedProduct = await Product.findById(id).populate(
			"category",
			"name",
		);

		res.status(200).json({
			success: true,
			message: "Product updated successfully",
			data: updatedProduct,
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: "Failed to update product",
			error: error.message,
		});
	}
};

// Delete Product
export const deleteProduct = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const userId = req.user?.userId;

		// Check if product exists
		const product = await Product.findById(id);
		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found",
			});
		}

		// Check if product is in any active orders
		const activeOrders = await Order.countDocuments({
			"items.product": id,
			status: { $nin: ["Cancelled", "Delivered"] },
		});

		if (activeOrders > 0) {
			return res.status(400).json({
				success: false,
				message:
					"Product is part of active orders and cannot be deleted",
			});
		}

		// Delete product
		await Product.findByIdAndDelete(id);

		// Remove from restock queue if present
		await RestockQueue.deleteMany({ product: id });

		// Log activity
		await logActivity({
			action: "Product Deleted",
			entityType: "Product",
			entityId: id,
			userId,
			description: `Product '${product.name}' deleted`,
		});

		res.status(200).json({
			success: true,
			message: "Product deleted successfully",
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: "Failed to delete product",
			error: error.message,
		});
	}
};

// Restock Product
export const restockProduct = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const userId = req.user?.userId;
		const { quantity } = req.body;

		// Validate quantity
		if (!quantity || typeof quantity !== "number" || quantity <= 0) {
			return res.status(400).json({
				success: false,
				message: "Quantity must be a positive number",
			});
		}

		// Find product
		const product = await Product.findById(id);
		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found",
			});
		}

		const oldStock = product.stock;
		product.stock += quantity;

		// Update status
		product.status = product.stock > 0 ? "Active" : "Out of Stock";

		await product.save();

		// If stock is now above threshold, mark restock queue as resolved
		if (product.stock >= product.minStockThreshold) {
			await RestockQueue.findOneAndUpdate(
				{ product: id, isResolved: false },
				{
					isResolved: true,
					resolvedAt: new Date(),
				},
			);
		}

		// Log activity
		await logActivity({
			action: "Stock Updated",
			entityType: "Product",
			entityId: product._id,
			userId,
			description: `Stock updated for '${product.name}' (+${quantity} units, ${oldStock} → ${product.stock})`,
		});

		const updatedProduct = await Product.findById(id).populate(
			"category",
			"name",
		);

		res.status(200).json({
			success: true,
			message: "Product restocked successfully",
			data: updatedProduct,
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: "Failed to restock product",
			error: error.message,
		});
	}
};

// Get Product By ID
export const getProductById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const product = await Product.findById(id).populate("category", "name");

		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found",
			});
		}

		res.status(200).json({
			success: true,
			data: product,
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: "Failed to fetch product",
			error: error.message,
		});
	}
};
