import express, { Express, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import productRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/orderRoutes";
import restockRoutes from "./routes/restockRoutes";
// import inventoryRoutes from "./routes/inventoryRoutes";

dotenv.config();

const app: Express = express();

// Middleware
app.use(
	cors({
		origin: process.env.CLIENT_URL || "http://localhost:3000",
		credentials: true,
	}),
);
app.use(express.json());
app.use(cookieParser());

// MongoDB Connection
const connectDB = async () => {
	try {
		const mongoUri =
			process.env.MONGODB_URI ||
			"mongodb://localhost:27017/smart-inventory";
		await mongoose.connect(mongoUri);
		console.log("✅ MongoDB connected successfully");
	} catch (error) {
		console.error("❌ MongoDB connection error:", error);
		process.exit(1);
	}
};

// Connect to database
connectDB();

// Routes
app.get("/api/health", (req: Request, res: Response) => {
	res.json({
		status: "ok",
		timestamp: new Date().toISOString(),
		database:
			mongoose.connection.readyState === 1 ? "connected" : "disconnected",
	});
});

// Seed endpoint - create demo user if doesn't exist
app.get("/api/seed", async (req: Request, res: Response) => {
	try {
		const { User } = await import("./models");
		const bcrypt = await import("bcryptjs");

		// Check if demo user already exists
		const existingUser = await User.findOne({
			email: "demo@inventory.com",
		});

		if (existingUser) {
			res.status(200).json({
				success: true,
				message: "Demo user already exists",
				user: {
					id: existingUser._id,
					name: existingUser.name,
					email: existingUser.email,
					role: existingUser.role,
				},
			});
			return;
		}

		// Create demo user
		const salt = await bcrypt.default.genSalt(10);
		const passwordHash = await bcrypt.default.hash("demo123", salt);

		const demoUser = await User.create({
			name: "Demo User",
			email: "demo@inventory.com",
			passwordHash,
			role: "admin",
		});

		res.status(201).json({
			success: true,
			message: "Seeded successfully",
			user: {
				id: demoUser._id,
				name: demoUser.name,
				email: demoUser.email,
				role: demoUser.role,
			},
		});
	} catch (error) {
		console.error("Seed error:", error);
		res.status(500).json({
			success: false,
			message: "Seeding failed",
		});
	}
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/restock", restockRoutes);
// app.use("/api/inventory", inventoryRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
	res.status(404).json({
		success: false,
		message: "Route not found",
	});
});

// Error handling middleware
app.use((err: any, req: Request, res: Response) => {
	console.error(err);
	res.status(500).json({
		success: false,
		message: "Internal server error",
		error: process.env.NODE_ENV === "development" ? err.message : undefined,
	});
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
	console.log(`🚀 Server running on port ${PORT}`);
	console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
	console.log(
		`🔗 MongoDB URI: ${process.env.MONGODB_URI || "mongodb://localhost:27017/smart-inventory"}`,
	);
});

export default app;
