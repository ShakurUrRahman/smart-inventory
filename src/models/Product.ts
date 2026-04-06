import { Schema, model, Document, Types } from "mongoose";

export interface IProduct extends Document {
	name: string;
	category: Types.ObjectId;
	price: number;
	stock: number;
	minStockThreshold: number;
	status: "Active" | "Out of Stock";
	createdBy: Types.ObjectId;
	approvalStatus: "pending" | "approved" | "rejected";
	approvedBy?: Types.ObjectId;
	approvedAt?: Date;
	rejectedBy?: Types.ObjectId;
	rejectedAt?: Date;
	rejectionReason?: string;
	createdAt: Date;
	updatedAt: Date;
}

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
			required: true,
		},
		approvalStatus: {
			type: String,
			enum: ["pending", "approved", "rejected"],
			default: "pending",
		},
		approvedBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			default: null,
		},
		approvedAt: {
			type: Date,
			default: null,
		},
		rejectedBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			default: null,
		},
		rejectedAt: {
			type: Date,
			default: null,
		},
		rejectionReason: {
			type: String,
			default: null,
		},
	},
	{ timestamps: true },
);

// Index for filtering by approval status and user
productSchema.index({ approvalStatus: 1, createdBy: 1 });
productSchema.index({ approvalStatus: 1 });

export default model<IProduct>("Product", productSchema);
