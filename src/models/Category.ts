import { Schema, model, Document, Types } from "mongoose";

// TypeScript Interface
export interface ICategory extends Document {
	name: string;
	createdBy: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

// Mongoose Schema
const categorySchema = new Schema<ICategory>(
	{
		name: {
			type: String,
			required: [true, "Category name is required"],
			unique: true,
			trim: true,
		},
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: false,
		},
	},
	{ timestamps: true },
);

export const Category = model<ICategory>("Category", categorySchema);
