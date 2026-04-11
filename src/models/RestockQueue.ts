import { Schema, model, Document, Types } from "mongoose";

export interface IRestockQueue extends Document {
	product: Types.ObjectId;
	currentStock: number;
	priority: "High" | "Medium" | "Low";
	isResolved: boolean;
	resolvedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

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

export default model<IRestockQueue>("RestockQueue", restockQueueSchema);
