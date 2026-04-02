import { Request, Response } from "express";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { logActivity } from "../utils/activityLogger";
import { generateOrderNumber } from "../utils/generateOrderNumber";
import { handleRestockCheck } from "../utils/restockHandler";

// Get All Orders with Filters & Pagination
export const getAllOrders = async (req: Request, res: Response) => {
	try {
		const {
			status = "",
			date = "",
			search = "",
			page = 1,
			limit = 10,
		} = req.query;

		const filter: any = {};

		// Status filter
		if (status && status !== "all") {
			filter.status = status;
		}

		// Date filter (match calendar day)
		if (date) {
			const filterDate = new Date(date as string);
			const nextDay = new Date(filterDate);
			nextDay.setDate(nextDay.getDate() + 1);

			filter.createdAt = {
				$gte: filterDate,
				$lt: nextDay,
			};
		}

		// Search by customer name (case-insensitive)
		if (search) {
			filter.customerName = { $regex: search, $options: "i" };
		}

		// Pagination
		const pageNum = Math.max(1, parseInt(page as string) || 1);
		const limitNum = Math.max(1, parseInt(limit as string) || 10);
		const skip = (pageNum - 1) * limitNum;

		// Get total count
		const total = await Order.countDocuments(filter);
		const totalPages = Math.ceil(total / limitNum);

		// Fetch orders
		const orders = await Order.find(filter)
			.populate("items.product", "name status")
			.populate("createdBy", "name")
			.skip(skip)
			.limit(limitNum)
			.sort({ createdAt: -1 });

		res.status(200).json({
			success: true,
			data: orders,
			total,
			page: pageNum,
			totalPages,
			limit: limitNum,
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: "Failed to fetch orders",
			error: error.message,
		});
	}
};

// Create Order with Multi-Step Validation
export const createOrder = async (req: Request, res: Response) => {
	try {
		const { customerName, items } = req.body;
		const userId = req.user?.userId;
		const conflicts: any[] = [];

		// ============================================
		// STEP A: Structural Validation
		// ============================================
		if (
			!customerName ||
			typeof customerName !== "string" ||
			customerName.trim().length < 2
		) {
			return res.status(400).json({
				success: false,
				message:
					"Customer name is required and must be at least 2 characters",
			});
		}

		if (!Array.isArray(items) || items.length === 0) {
			return res.status(400).json({
				success: false,
				message: "Order must contain at least one product",
			});
		}

		// Check for duplicate product IDs in items
		const productIds = items.map((item) => item.productId);
		const uniqueIds = new Set(productIds);

		if (uniqueIds.size !== productIds.length) {
			const seen = new Set();
			items.forEach((item) => {
				if (seen.has(item.productId)) {
					conflicts.push({
						productId: item.productId,
						name: `Product ID ${item.productId} already added`,
					});
				}
				seen.add(item.productId);
			});

			return res.status(400).json({
				success: false,
				message: "Duplicate products in order",
				conflicts,
			});
		}

		// ============================================
		// STEP B: Per-Product Validation
		// ============================================
		const productIds2 = items.map((item) => item.productId);
		const products = await Product.find({ _id: { $in: productIds2 } });
		const productMap = new Map(products.map((p) => [p._id.toString(), p]));

		items.forEach((item) => {
			const product = productMap.get(item.productId.toString());

			if (!product) {
				conflicts.push({
					productId: item.productId,
					error: "Product not found",
				});
				return;
			}

			if (product.status !== "Active") {
				conflicts.push({
					productId: item.productId,
					error: `Product '${product.name}' is currently unavailable`,
				});
				return;
			}

			if (product.stock < item.quantity) {
				conflicts.push({
					productId: item.productId,
					error: `Only ${product.stock} items available for '${product.name}'`,
				});
				return;
			}

			if (!item.quantity || item.quantity < 1) {
				conflicts.push({
					productId: item.productId,
					error: `Quantity must be at least 1 for '${product.name}'`,
				});
				return;
			}
		});

		if (conflicts.length > 0) {
			return res.status(400).json({
				success: false,
				message: "Order validation failed",
				conflicts,
			});
		}

		// ============================================
		// STEP C: Create Order (all checks passed)
		// ============================================
		const orderNumber = await generateOrderNumber();

		const orderItems = items.map((item) => {
			const product = productMap.get(item.productId.toString())!;
			const subtotal = item.quantity * product.price;

			return {
				product: product._id,
				productName: product.name,
				quantity: item.quantity,
				unitPrice: product.price,
				subtotal,
			};
		});

		const totalPrice = orderItems.reduce(
			(sum, item) => sum + item.subtotal,
			0,
		);

		const order = await Order.create({
			orderNumber,
			customerName,
			items: orderItems,
			totalPrice,
			status: "Pending",
			createdBy: userId,
		});

		// ============================================
		// STEP D: Stock Deduction & RestockQueue Update
		// ============================================
		for (const item of items) {
			const product = productMap.get(item.productId.toString())!;

			// Deduct stock
			product.stock -= item.quantity;

			// Update status if out of stock
			if (product.stock === 0) {
				product.status = "Out of Stock";
			}

			// Save product
			await product.save();

			// Handle restock queue
			await handleRestockCheck(product);
		}

		// ============================================
		// STEP E: Log Activity
		// ============================================
		await logActivity({
			action: "Order Created",
			entityType: "Order",
			entityId: order._id,
			userId,
			description: `Order '${orderNumber}' created for ${customerName}`,
		});

		// Populate and return
		const populatedOrder = await Order.findById(order._id)
			.populate("items.product", "name status")
			.populate("createdBy", "name");

		res.status(201).json({
			success: true,
			message: "Order created successfully",
			data: populatedOrder,
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: "Failed to create order",
			error: error.message,
		});
	}
};

// Update Order Status
export const updateOrderStatus = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { status } = req.body;
		const userId = req.user?.userId;

		// Find order
		const order = await Order.findById(id).populate("items.product");
		if (!order) {
			return res.status(404).json({
				success: false,
				message: "Order not found",
			});
		}

		// Validate status transition
		const validTransitions: { [key: string]: string[] } = {
			Pending: ["Confirmed", "Cancelled"],
			Confirmed: ["Shipped", "Cancelled"],
			Shipped: ["Delivered"],
			Delivered: [],
			Cancelled: [],
		};

		const allowedTransitions = validTransitions[order.status] || [];
		if (!allowedTransitions.includes(status)) {
			return res.status(400).json({
				success: false,
				message: `Cannot move order from ${order.status} to ${status}`,
			});
		}

		// If cancelling: restore stock
		if (status === "Cancelled") {
			for (const item of order.items) {
				const product = await Product.findById(item.product);
				if (product) {
					// Restore stock
					product.stock += item.quantity;

					// Update status if now has stock
					if (
						product.stock > 0 &&
						product.status === "Out of Stock"
					) {
						product.status = "Active";
					}

					await product.save();
					await handleRestockCheck(product);
				}
			}
		}

		// Update order status
		order.status = status;
		await order.save();

		// Log activity
		await logActivity({
			action: "Order Status Updated",
			entityType: "Order",
			entityId: order._id,
			userId,
			description: `Order '${order.orderNumber}' marked as ${status}`,
		});

		// Populate and return
		const updatedOrder = await Order.findById(id)
			.populate("items.product", "name status")
			.populate("createdBy", "name");

		res.status(200).json({
			success: true,
			message: "Order status updated successfully",
			data: updatedOrder,
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: "Failed to update order status",
			error: error.message,
		});
	}
};

// Get Order By ID
export const getOrderById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const order = await Order.findById(id)
			.populate("items.product")
			.populate("createdBy", "name email role");

		if (!order) {
			return res.status(404).json({
				success: false,
				message: "Order not found",
			});
		}

		res.status(200).json({
			success: true,
			data: order,
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: "Failed to fetch order",
			error: error.message,
		});
	}
};
