import { Schema, model, Document, Types } from "mongoose";

// TypeScript Interface
export interface IProduct extends Document {
	name: string;
	category: Types.ObjectId;
	price: number;
	stock: number;
	minStockThreshold: number;
	status: "Active" | "Out of Stock";
	createdBy: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

// Mongoose Schema
const productSchema = new Schema<IProduct>(
	{
		name: {
			type: String,
			required: [true, "Product name is required"],
			trim: true,
		},
		category: {
			type: Schema.Types.ObjectId,
			ref: "Category",
			required: [true, "Category is required"],
		},
		price: {
			type: Number,
			required: [true, "Price is required"],
			min: [0, "Price cannot be negative"],
		},
		stock: {
			type: Number,
			required: [true, "Stock is required"],
			min: [0, "Stock cannot be negative"],
		},
		minStockThreshold: {
			type: Number,
			required: [true, "Minimum stock threshold is required"],
			min: [1, "Threshold must be at least 1"],
		},
		status: {
			type: String,
			enum: ["Active", "Out of Stock"],
			default: "Active",
		},
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: false,
		},
	},
	{ timestamps: true },
);

export const Product = model<IProduct>("Product", productSchema);
