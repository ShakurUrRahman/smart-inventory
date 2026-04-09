import User, { IUser } from "../models/User";
import Product, { IProduct } from "../models/Product";
import { Category } from "../models/Category";
import { Order } from "../models/Order";
import bcrypt from "bcryptjs";
// import { handleRestockCheck } from "./restockHandler";

// Mock or import this function if it exists in your utils
const handleRestockCheck = async (product: any) => {
	if (product.stock <= product.minStockThreshold) {
		console.log(`⚠️  Restock alert for: ${product.name}`);
	}
};

export const seedDatabase = async () => {
	try {
		// Check if already seeded
		const existingSuper = await User.findOne({ role: "super_admin" });
		if (existingSuper) {
			console.log("✅ Database already seeded");
			return;
		}

		console.log("🌱 Starting database seed...\n");

		// Hash passwords helper
		const salt = await bcrypt.genSalt(10);
		const hashPassword = async (password: string) =>
			bcrypt.hash(password, salt);

		// ─────────────────────────────────────────
		// 1. CREATE USERS
		// ─────────────────────────────────────────

		const superAdmin = await User.create({
			name: "Super Admin",
			email: "superadmin@inventory.com",
			passwordHash: await hashPassword("superadmin123"),
			role: "super_admin",
			isSuperAdmin: true,
			categoryPermissions: {
				canCreate: true,
				canUpdate: true,
				canDelete: true,
			},
			isActive: true,
		});

		const admin = await User.create({
			name: "Admin User",
			email: "admin@inventory.com",
			passwordHash: await hashPassword("admin123"),
			role: "admin",
			categoryPermissions: {
				canCreate: true,
				canUpdate: true,
				canDelete: true,
			},
			isActive: true,
		});

		const manager = await User.create({
			name: "Manager User",
			email: "manager@inventory.com",
			passwordHash: await hashPassword("manager123"),
			role: "manager",
			categoryPermissions: {
				canCreate: false,
				canUpdate: false,
				canDelete: false,
			},
			isActive: true,
		});

		const regularUser = await User.create({
			name: "Regular User",
			email: "user@inventory.com",
			passwordHash: await hashPassword("user123"),
			role: "user",
			isActive: true,
		});

		console.log("👥 Users created (SuperAdmin, Admin, Manager, User)");

		// ─────────────────────────────────────────
		// 2. CREATE CATEGORIES
		// ─────────────────────────────────────────

		const categories = await Category.insertMany([
			{ name: "Electronics", createdBy: admin._id },
			{ name: "Clothing", createdBy: admin._id },
			{ name: "Food & Beverages", createdBy: manager._id },
		]);

		console.log(`📁 Created ${categories.length} categories`);

		// ─────────────────────────────────────────
		// 3. CREATE PRODUCTS
		// ─────────────────────────────────────────

		// Approved products from Manager
		const productData = [];
		for (let i = 1; i <= 5; i++) {
			const p = await Product.create({
				name: `Premium Item ${i}`,
				description: `High quality item number ${i}`,
				category: i % 2 === 0 ? categories[0]._id : categories[1]._id,
				price: 50 + i * 10,
				stock: 20,
				minStockThreshold: 5,
				createdBy: manager._id,
				approvalStatus: "approved",
				approvedBy: admin._id,
				approvedAt: new Date(),
			});
			productData.push(p);
			await handleRestockCheck(p);
		}

		// Pending products from User
		await Product.create({
			name: "USB-C Hub",
			description: "Pending approval",
			category: categories[0]._id,
			price: 49.99,
			stock: 25,
			minStockThreshold: 5,
			createdBy: regularUser._id,
			approvalStatus: "pending",
		});

		// Rejected product
		await Product.create({
			name: "Broken Monitor",
			description: "Defective unit",
			category: categories[0]._id,
			price: 199.99,
			stock: 0,
			minStockThreshold: 5,
			createdBy: regularUser._id,
			approvalStatus: "rejected",
			rejectionReason: "Incomplete specifications",
		});

		console.log("📦 Products created (Approved, Pending, and Rejected)");

		// ─────────────────────────────────────────
		// 4. CREATE SAMPLE ORDER
		// ─────────────────────────────────────────

		const order = await Order.create({
			orderNumber: `ORD-${Date.now()}`,
			createdBy: regularUser._id,
			items: [
				{
					product: productData[0]._id,
					quantity: 1,
					price: productData[0].price,
				},
			],
			totalAmount: productData[0].price,
			status: "completed",
		});

		console.log("📋 Sample order created");

		// ─────────────────────────────────────────
		// FINAL SUMMARY
		// ─────────────────────────────────────────

		console.log("\n✅ Database seeding completed successfully!");
		console.log("------------------------------------------");
		console.log("Admin: admin@inventory.com / admin123");
		console.log("User:  user@inventory.com / user123");
		console.log("------------------------------------------\n");
	} catch (error: any) {
		console.error("❌ Seed error:", error.message);
		throw error;
	}
};
