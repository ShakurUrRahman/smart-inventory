import { Schema, model, Document, Types } from "mongoose";

// TypeScript Interface for Order Item
export interface IOrderItem {
	product: Types.ObjectId;
	productName: string;
	quantity: number;
	unitPrice: number;
	subtotal: number;
}

// TypeScript Interface for Order
export interface IOrder extends Document {
	orderNumber: string;
	customerName: string;
	items: IOrderItem[];
	totalPrice: number;
	status: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
	createdBy: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

// Order Item Schema
const orderItemSchema = new Schema<IOrderItem>(
	{
		product: {
			type: Schema.Types.ObjectId,
			ref: "Product",
			required: false,
		},
		productName: {
			type: String,
			required: [true, "Product name is required"],
		},
		quantity: {
			type: Number,
			required: [true, "Quantity is required"],
			min: [1, "Quantity must be at least 1"],
		},
		unitPrice: {
			type: Number,
			required: [true, "Unit price is required"],
			min: [0, "Price cannot be negative"],
		},
		subtotal: {
			type: Number,
			required: [true, "Subtotal is required"],
			min: [0, "Subtotal cannot be negative"],
		},
	},
	{ _id: false },
);

// Order Schema
const orderSchema = new Schema<IOrder>(
	{
		orderNumber: {
			type: String,
			unique: true,
			required: true,
		},
		customerName: {
			type: String,
			required: [true, "Customer name is required"],
			trim: true,
		},
		items: [orderItemSchema],
		totalPrice: {
			type: Number,
			required: [true, "Total price is required"],
			min: [0, "Total price cannot be negative"],
		},
		status: {
			type: String,
			enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
			default: "Pending",
		},
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: false,
		},
	},
	{ timestamps: true },
);

// Pre-save hook to auto-generate order number if not provided
orderSchema.pre<IOrder>("save", async function (next) {
	if (!this.orderNumber) {
		// Count existing orders and generate new number
		const lastOrder = await Order.findOne().sort({ createdAt: -1 });
		const nextNumber = lastOrder
			? 1001 + (await Order.countDocuments())
			: 1001;
		this.orderNumber = `ORD-${nextNumber}`;
	}
	next();
});

export const Order = model<IOrder>("Order", orderSchema);
