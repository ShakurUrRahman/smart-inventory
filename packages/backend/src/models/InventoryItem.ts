import mongoose, { Schema, Document } from "mongoose";

export interface IInventoryItem extends Document {
	name: string;
	description?: string;
	sku: string;
	quantity: number;
	reorderLevel: number;
	price: number;
	category: string;
	supplier?: string;
	lastRestocked?: Date;
	createdAt: Date;
	updatedAt: Date;
}

const inventoryItemSchema = new Schema<IInventoryItem>(
	{
		name: {
			type: String,
			required: [true, "Product name is required"],
			trim: true,
		},
		description: {
			type: String,
			trim: true,
		},
		sku: {
			type: String,
			required: [true, "SKU is required"],
			unique: true,
			trim: true,
			uppercase: true,
		},
		quantity: {
			type: Number,
			required: [true, "Quantity is required"],
			min: [0, "Quantity cannot be negative"],
			default: 0,
		},
		reorderLevel: {
			type: Number,
			required: [true, "Reorder level is required"],
			min: [0, "Reorder level cannot be negative"],
			default: 10,
		},
		price: {
			type: Number,
			required: [true, "Price is required"],
			min: [0, "Price cannot be negative"],
		},
		category: {
			type: String,
			required: [true, "Category is required"],
			trim: true,
		},
		supplier: {
			type: String,
			trim: true,
		},
		lastRestocked: {
			type: Date,
		},
	},
	{
		timestamps: true,
	},
);

// Index for faster queries
inventoryItemSchema.index({ sku: 1 });
inventoryItemSchema.index({ category: 1 });
inventoryItemSchema.index({ name: "text" });

export default mongoose.model<IInventoryItem>(
	"InventoryItem",
	inventoryItemSchema,
);
