import { User } from "../models";
import { Category } from "../models";
import { Product } from "../models";
import { Order } from "../models";
import { ActivityLog } from "../models";
import bcryptjs from "bcryptjs";
import { handleRestockCheck } from "./utils/restockHandler";
import { RestockQueue } from "../models";

export const seedDatabase = async () => {
	try {
		// Check if demo user exists
		const existingUser = await User.findOne({
			email: "demo@inventory.com",
		});
		if (existingUser) {
			return {
				message: "Database already seeded",
				summary: { skipped: true },
			};
		}

		console.log("🌱 Starting database seed...");

		// 1. CREATE USERS
		const salt = await bcryptjs.genSalt(10);
		const users = await User.insertMany([
			{
				name: "Demo User",
				email: "demo@inventory.com",
				passwordHash: await bcryptjs.hash("demo123", salt),
				role: "admin",
			},
			{
				name: "Jane Manager",
				email: "manager@inventory.com",
				passwordHash: await bcryptjs.hash("manager123", salt),
				role: "manager",
			},
		]);
		console.log("✓ Created 2 users");

		// 2. CREATE CATEGORIES
		const categories = await Category.insertMany([
			{ name: "Electronics", createdBy: users[0]._id },
			{ name: "Clothing", createdBy: users[0]._id },
			{ name: "Grocery", createdBy: users[0]._id },
			{ name: "Accessories", createdBy: users[0]._id },
			{ name: "Stationery", createdBy: users[0]._id },
		]);
		console.log("✓ Created 5 categories");

		// 3. CREATE PRODUCTS
		const productsData = [
			// Electronics
			{
				name: "iPhone 13",
				category: categories[0]._id,
				price: 999,
				stock: 3,
				minStockThreshold: 5,
				status: "Out of Stock",
				createdBy: users[0]._id,
			},
			{
				name: 'Samsung TV 55"',
				category: categories[0]._id,
				price: 799,
				stock: 8,
				minStockThreshold: 3,
				status: "Active",
				createdBy: users[0]._id,
			},
			{
				name: "Wireless Headphones",
				category: categories[0]._id,
				price: 149,
				stock: 2,
				minStockThreshold: 5,
				status: "Out of Stock",
				createdBy: users[0]._id,
			},
			{
				name: "Laptop Stand",
				category: categories[0]._id,
				price: 49,
				stock: 0,
				minStockThreshold: 3,
				status: "Out of Stock",
				createdBy: users[0]._id,
			},
			// Clothing
			{
				name: "White T-Shirt",
				category: categories[1]._id,
				price: 19.99,
				stock: 45,
				minStockThreshold: 10,
				status: "Active",
				createdBy: users[0]._id,
			},
			{
				name: "Blue Jeans",
				category: categories[1]._id,
				price: 59.99,
				stock: 12,
				minStockThreshold: 8,
				status: "Active",
				createdBy: users[0]._id,
			},
			{
				name: "Hoodie",
				category: categories[1]._id,
				price: 39.99,
				stock: 1,
				minStockThreshold: 5,
				status: "Out of Stock",
				createdBy: users[0]._id,
			},
			// Grocery
			{
				name: "Olive Oil 1L",
				category: categories[2]._id,
				price: 12.99,
				stock: 30,
				minStockThreshold: 10,
				status: "Active",
				createdBy: users[0]._id,
			},
			{
				name: "Green Tea Box",
				category: categories[2]._id,
				price: 8.99,
				stock: 4,
				minStockThreshold: 8,
				status: "Out of Stock",
				createdBy: users[0]._id,
			},
			{
				name: "Protein Bar Pack",
				category: categories[2]._id,
				price: 24.99,
				stock: 60,
				minStockThreshold: 15,
				status: "Active",
				createdBy: users[0]._id,
			},
			// Accessories
			{
				name: "Leather Wallet",
				category: categories[3]._id,
				price: 34.99,
				stock: 7,
				minStockThreshold: 5,
				status: "Active",
				createdBy: users[0]._id,
			},
			{
				name: "Sunglasses",
				category: categories[3]._id,
				price: 29.99,
				stock: 0,
				minStockThreshold: 3,
				status: "Out of Stock",
				createdBy: users[0]._id,
			},
			// Stationery
			{
				name: "A4 Notebook",
				category: categories[4]._id,
				price: 6.99,
				stock: 100,
				minStockThreshold: 20,
				status: "Active",
				createdBy: users[0]._id,
			},
			{
				name: "Ballpoint Pen 10pk",
				category: categories[4]._id,
				price: 4.99,
				stock: 200,
				minStockThreshold: 30,
				status: "Active",
				createdBy: users[0]._id,
			},
			{
				name: "Sticky Notes",
				category: categories[4]._id,
				price: 3.99,
				stock: 5,
				minStockThreshold: 10,
				status: "Out of Stock",
				createdBy: users[0]._id,
			},
		];

		const products = await Product.insertMany(productsData);
		console.log("✓ Created 15 products");

		// Handle restock queue for low stock products
		for (const product of products) {
			await handleRestockCheck(product);
		}
		console.log("✓ Populated RestockQueue");

		// 4. CREATE ORDERS
		const now = new Date();
		const orders = [];

		const orderConfigs = [
			{
				customerName: "John Doe",
				items: [
					{ product: products[0]._id, quantity: 1 },
					{ product: products[1]._id, quantity: 1 },
				],
				status: "Pending",
				daysAgo: 2,
			},
			{
				customerName: "Alice Smith",
				items: [
					{ product: products[4]._id, quantity: 2 },
					{ product: products[5]._id, quantity: 1 },
				],
				status: "Confirmed",
				daysAgo: 3,
			},
			{
				customerName: "Bob Johnson",
				items: [{ product: products[9]._id, quantity: 3 }],
				status: "Shipped",
				daysAgo: 5,
			},
			{
				customerName: "Diana Prince",
				items: [
					{ product: products[7]._id, quantity: 2 },
					{ product: products[10]._id, quantity: 1 },
				],
				status: "Delivered",
				daysAgo: 7,
			},
			{
				customerName: "Charlie Brown",
				items: [{ product: products[13]._id, quantity: 5 }],
				status: "Pending",
				daysAgo: 1,
			},
			{
				customerName: "Eve Wilson",
				items: [
					{ product: products[4]._id, quantity: 3 },
					{ product: products[6]._id, quantity: 2 },
				],
				status: "Confirmed",
				daysAgo: 4,
			},
			{
				customerName: "Frank Miller",
				items: [{ product: products[11]._id, quantity: 1 }],
				status: "Shipped",
				daysAgo: 2,
			},
			{
				customerName: "Grace Lee",
				items: [
					{ product: products[12]._id, quantity: 10 },
					{ product: products[14]._id, quantity: 5 },
				],
				status: "Delivered",
				daysAgo: 6,
			},
			{
				customerName: "Henry Taylor",
				items: [{ product: products[8]._id, quantity: 1 }],
				status: "Cancelled",
				daysAgo: 3,
			},
			{
				customerName: "Ivy Chen",
				items: [
					{ product: products[2]._id, quantity: 1 },
					{ product: products[3]._id, quantity: 2 },
				],
				status: "Pending",
				daysAgo: 0,
			},
		];

		for (let i = 0; i < orderConfigs.length; i++) {
			const config = orderConfigs[i];
			const orderDate = new Date(
				now.getTime() - config.daysAgo * 24 * 60 * 60 * 1000,
			);

			const items = config.items.map((item) => {
				const product = products.find((p) =>
					p._id.equals(item.product),
				);
				return {
					product: item.product,
					productName: product?.name || "Unknown",
					quantity: item.quantity,
					unitPrice: product?.price || 0,
					subtotal: (product?.price || 0) * item.quantity,
				};
			});

			const totalPrice = items.reduce(
				(sum, item) => sum + item.subtotal,
				0,
			);

			orders.push({
				orderNumber: `ORD-${String(i + 1).padStart(4, "0")}`,
				customerName: config.customerName,
				items,
				totalPrice,
				status: config.status,
				createdBy: users[0]._id,
				createdAt: orderDate,
			});
		}

		const createdOrders = await Order.insertMany(orders);
		console.log("✓ Created 10 orders");

		// Return summary
		return {
			message: "Database seeded successfully",
			summary: {
				users: users.length,
				categories: categories.length,
				products: products.length,
				orders: createdOrders.length,
				restockQueueItems: await RestockQueue.countDocuments(),
			},
		};
	} catch (error: any) {
		console.error("Seed error:", error);
		throw error;
	}
};
