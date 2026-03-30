import { Schema, model, Document, Types } from "mongoose";

// TypeScript Interface
export interface IRestockQueue extends Document {
	product: Types.ObjectId;
	currentStock: number;
	threshold: number;
	priority: "High" | "Medium" | "Low";
	isResolved: boolean;
	resolvedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

// Mongoose Schema
const restockQueueSchema = new Schema<IRestockQueue>(
	{
		product: {
			type: Schema.Types.ObjectId,
			ref: "Product",
			required: [true, "Product is required"],
			unique: true,
		},
		currentStock: {
			type: Number,
			required: [true, "Current stock is required"],
			min: [0, "Stock cannot be negative"],
		},
		threshold: {
			type: Number,
			required: [true, "Threshold is required"],
			min: [1, "Threshold must be at least 1"],
		},
		priority: {
			type: String,
			enum: ["High", "Medium", "Low"],
			default: "Medium",
		},
		isResolved: {
			type: Boolean,
			default: false,
		},
		resolvedAt: {
			type: Date,
			default: null,
		},
	},
	{ timestamps: true },
);

export const RestockQueue = model<IRestockQueue>(
	"RestockQueue",
	restockQueueSchema,
);
