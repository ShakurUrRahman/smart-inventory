import { Schema, model, Document, Types } from "mongoose";

// TypeScript Interface
export interface IActivityLog extends Document {
	action: string;
	entityType:
		| "Order"
		| "Product"
		| "Stock"
		| "User"
		| "Category"
		| "RestockQueue";
	entityId: Types.ObjectId;
	description?: string;
	performedBy: Types.ObjectId;
	createdAt: Date;
}

// Mongoose Schema
const activityLogSchema = new Schema<IActivityLog>(
	{
		action: {
			type: String,
			required: [true, "Action is required"],
		},
		entityType: {
			type: String,
			enum: [
				"Order",
				"Product",
				"Stock",
				"User",
				"Category",
				"RestockQueue",
			],
			required: [true, "Entity type is required"],
		},
		description: {
			type: String,
			required: false,
		},
		entityId: {
			type: Schema.Types.ObjectId,
			required: false,
		},
		performedBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: false,
		},
	},
	{ timestamps: { createdAt: true, updatedAt: false } },
);

export const ActivityLog = model<IActivityLog>(
	"ActivityLog",
	activityLogSchema,
);
