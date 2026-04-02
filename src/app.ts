import express, { Express, Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import productRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/orderRoutes";
import restockRoutes from "./routes/restockRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import activityRoutes from "./routes/activityRoutes";

dotenv.config();

const app: Express = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(
	cors({
		origin: process.env.CLIENT_URL || "http://localhost:3000",
		credentials: true,
	}),
);
app.use(express.json());
app.use(cookieParser());

// ─── MongoDB Connection ───────────────────────────────────────────────────────
export const connectDB = async () => {
	try {
		if (mongoose.connection.readyState === 1) return;
		const mongoUri =
			process.env.MONGODB_URI ||
			"mongodb://localhost:27017/smart-inventory";
		await mongoose.connect(mongoUri, {
			serverSelectionTimeoutMS: 10000,
			// bufferCommands: false,
		});
		console.log("✅ MongoDB connected successfully");
	} catch (error) {
		console.error("❌ MongoDB connection error:", error);
		throw error;
	}
};

connectDB();

app.use(async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (mongoose.connection.readyState !== 1) {
			await connectDB();
		}
		next();
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Database connection failed",
		});
	}
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", (req: Request, res: Response) => {
	res.json({
		status: "ok",
		timestamp: new Date().toISOString(),
		database:
			mongoose.connection.readyState === 1 ? "connected" : "disconnected",
	});
});

// ─── Seed Route ───────────────────────────────────────────────────────────────
app.get("/api/seed", async (req: Request, res: Response) => {
	try {
		if (mongoose.connection.readyState !== 1) {
			await connectDB();
		}
		const { seedDatabase } = await import("./utils/seedDatabase");
		const result = await seedDatabase();
		res.status(201).json({ success: true, ...result });
	} catch (error: any) {
		console.error("Seed error:", error);
		res.status(500).json({
			success: false,
			message: "Seeding failed",
			error: error.message,
		});
	}
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/restock", restockRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/activity", activityRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req: Request, res: Response) => {
	res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
	console.error("Unhandled error:", err);
	res.status(err.status || 500).json({
		success: false,
		message: err.message || "Internal server error",
		error: process.env.NODE_ENV === "development" ? err.stack : undefined,
	});
});

// ─── Local Dev Server ─────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
	const PORT = process.env.PORT || 5000;
	app.listen(PORT, () => {
		console.log(`🚀 Server running on port ${PORT}`);
		console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
		console.log(
			`🔗 MongoDB: ${process.env.MONGODB_URI ? "Atlas (env)" : "localhost"}`,
		);
	});
}

// ─── Export for Vercel ────────────────────────────────────────────────────────
export default app;
