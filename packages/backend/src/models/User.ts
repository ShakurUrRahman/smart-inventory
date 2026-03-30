import { Schema, model, Document } from "mongoose";

// TypeScript Interface
export interface IUser extends Document {
	name: string;
	email: string;
	passwordHash: string;
	role: "admin" | "manager";
	createdAt: Date;
	updatedAt: Date;
}

// Mongoose Schema
const userSchema = new Schema<IUser>(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			lowercase: true,
			match: [
				/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
				"Please provide a valid email",
			],
		},
		passwordHash: {
			type: String,
			required: [true, "Password is required"],
			minlength: 6,
			select: false, // Don't return password by default
		},
		role: {
			type: String,
			enum: ["admin", "manager"],
			default: "manager",
		},
	},
	{ timestamps: true },
);

export const User = model<IUser>("User", userSchema);
