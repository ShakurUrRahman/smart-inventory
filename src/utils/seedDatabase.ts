import User from "../models/User";
import { Category } from "../models/Category";
import Product from "../models/Product";

export const seedDatabase = async () => {
	// ─── Skip if already seeded ───────────────────────────────────────────────
	const existing = await User.findOne({ email: "superadmin@inventory.com" });
	if (existing) {
		return {
			message: "Database already seeded",
			summary: { skipped: true },
		};
	}

	// ─── 1. USERS ─────────────────────────────────────────────────────────────
	// No need to manually hash — userSchema.pre("save") handles it

	const superAdmin = await User.create({
		name: "Super Admin",
		email: "superadmin@inventory.com",
		passwordHash: "superadmin123", // hook will hash this
		role: "super_admin",
		isSuperAdmin: true,
		isActive: true,
		categoryPermissions: {
			canCreate: true,
			canUpdate: true,
			canDelete: true,
		},
	});

	const admin = await User.create({
		name: "Admin User",
		email: "admin@inventory.com",
		passwordHash: "admin123",
		role: "admin",
		isSuperAdmin: false,
		isActive: true,
		categoryPermissions: {
			canCreate: true,
			canUpdate: true,
			canDelete: true,
		},
	});

	const manager = await User.create({
		name: "Jane Manager",
		email: "manager@inventory.com",
		passwordHash: "manager123",
		role: "manager",
		isSuperAdmin: false,
		isActive: true,
		categoryPermissions: {
			canCreate: true,
			canUpdate: false,
			canDelete: false,
		},
	});

	const demoUser = await User.create({
		name: "Demo User",
		email: "user@inventory.com",
		passwordHash: "user123",
		role: "user",
		isSuperAdmin: false,
		isActive: true,
		categoryPermissions: {
			canCreate: false,
			canUpdate: false,
			canDelete: false,
		},
	});

	// ─── 2. CATEGORIES ────────────────────────────────────────────────────────
	const categoryNames = [
		"Clothing",
		"Food & Beverage",
		"Office Supplies",
		"Sports & Fitness",
	];

	const categories = await Category.insertMany(
		categoryNames.map((name) => ({
			name,
			createdBy: superAdmin._id,
		})),
	);

	const [clothing, food, office, sports] = categories;

	// ─── 3. PRODUCTS ──────────────────────────────────────────────────────────

	// 10 approved products
	await Product.insertMany([
		// {
		// 	name: 'MacBook Pro 14"',
		// 	category: electronics._id,
		// 	price: 1999.99,
		// 	stock: 25,
		// 	minStockThreshold: 5,
		// 	status: "Active",
		// 	approvalStatus: "approved",
		// 	approvedBy: admin._id,
		// 	approvedAt: new Date(),
		// 	createdBy: admin._id,
		// },
		// {
		// 	name: "iPhone 15 Pro",
		// 	category: electronics._id,
		// 	price: 1199.99,
		// 	stock: 50,
		// 	minStockThreshold: 10,
		// 	status: "Active",
		// 	approvalStatus: "approved",
		// 	approvedBy: admin._id,
		// 	approvedAt: new Date(),
		// 	createdBy: admin._id,
		// },
		// {
		// 	name: "Sony WH-1000XM5",
		// 	category: electronics._id,
		// 	price: 349.99,
		// 	stock: 80,
		// 	minStockThreshold: 15,
		// 	status: "Active",
		// 	approvalStatus: "approved",
		// 	approvedBy: admin._id,
		// 	approvedAt: new Date(),
		// 	createdBy: admin._id,
		// },
		// {
		// 	name: "Samsung 4K Monitor",
		// 	category: electronics._id,
		// 	price: 599.99,
		// 	stock: 30,
		// 	minStockThreshold: 5,
		// 	status: "Active",
		// 	approvalStatus: "approved",
		// 	approvedBy: admin._id,
		// 	approvedAt: new Date(),
		// 	createdBy: admin._id,
		// },
		{
			name: "Nike Air Max 270",
			category: clothing._id,
			price: 149.99,
			stock: 120,
			minStockThreshold: 20,
			status: "Active",
			approvalStatus: "approved",
			approvedBy: admin._id,
			approvedAt: new Date(),
			createdBy: admin._id,
		},
		{
			name: "Levi's 501 Jeans",
			category: clothing._id,
			price: 89.99,
			stock: 200,
			minStockThreshold: 30,
			status: "Active",
			approvalStatus: "approved",
			approvedBy: admin._id,
			approvedAt: new Date(),
			createdBy: admin._id,
		},
		{
			name: "Organic Green Tea",
			category: food._id,
			price: 24.99,
			stock: 500,
			minStockThreshold: 50,
			status: "Active",
			approvalStatus: "approved",
			approvedBy: admin._id,
			approvedAt: new Date(),
			createdBy: admin._id,
		},
		{
			name: "Ergonomic Office Chair",
			category: office._id,
			price: 449.99,
			stock: 15,
			minStockThreshold: 3,
			status: "Active",
			approvalStatus: "approved",
			approvedBy: admin._id,
			approvedAt: new Date(),
			createdBy: admin._id,
		},
		{
			name: "Mechanical Keyboard",
			category: office._id,
			price: 129.99,
			stock: 60,
			minStockThreshold: 10,
			status: "Active",
			approvalStatus: "approved",
			approvedBy: admin._id,
			approvedAt: new Date(),
			createdBy: admin._id,
		},
		{
			name: "Yoga Mat Pro",
			category: sports._id,
			price: 79.99,
			stock: 90,
			minStockThreshold: 15,
			status: "Active",
			approvalStatus: "approved",
			approvedBy: admin._id,
			approvedAt: new Date(),
			createdBy: admin._id,
		},
	]);

	// 3 pending products (created by demo user)
	await Product.insertMany([
		// {
		// 	name: "Wireless Earbuds X1",
		// 	category: electronics._id,
		// 	price: 79.99,
		// 	stock: 40,
		// 	minStockThreshold: 10,
		// 	status: "Active",
		// 	approvalStatus: "pending",
		// 	createdBy: demoUser._id,
		// },
		{
			name: "Running Shorts Elite",
			category: sports._id,
			price: 44.99,
			stock: 75,
			minStockThreshold: 15,
			status: "Active",
			approvalStatus: "pending",
			createdBy: demoUser._id,
		},
		{
			name: "Vitamin C Supplement",
			category: food._id,
			price: 19.99,
			stock: 200,
			minStockThreshold: 30,
			status: "Active",
			approvalStatus: "pending",
			createdBy: demoUser._id,
		},
	]);

	// 2 rejected products
	await Product.insertMany([
		// {
		// 	name: "Mystery Gadget",
		// 	category: electronics._id,
		// 	price: 9.99,
		// 	stock: 0,
		// 	minStockThreshold: 5,
		// 	status: "Inactive",
		// 	approvalStatus: "rejected",
		// 	rejectedBy: admin._id,
		// 	rejectedAt: new Date(),
		// 	rejectionReason: "Incomplete product information provided.",
		// 	createdBy: demoUser._id,
		// },
		{
			name: "Unknown Supplement",
			category: food._id,
			price: 5.99,
			stock: 0,
			minStockThreshold: 10,
			status: "Inactive",
			approvalStatus: "rejected",
			rejectedBy: admin._id,
			rejectedAt: new Date(),
			rejectionReason: "Incomplete product information provided.",
			createdBy: demoUser._id,
		},
	]);

	// ─── RESULT ───────────────────────────────────────────────────────────────
	return {
		message: "Seeded successfully",
		credentials: {
			superAdmin: "superadmin@inventory.com / superadmin123",
			admin: "admin@inventory.com / admin123",
			manager: "manager@inventory.com / manager123",
			user: "user@inventory.com / user123",
		},
		summary: {
			users: 4,
			categories: 5,
			products: 15,
		},
	};
};
