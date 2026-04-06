import { Schema, model, Document, Types } from "mongoose";
import bcryptjs from "bcryptjs";

export interface IUser extends Document {
	name: string;
	email: string;
	passwordHash: string;
	role: "user" | "manager" | "admin" | "super_admin";
	isSuperAdmin: boolean;
	categoryPermissions: {
		canCreate: boolean;
		canUpdate: boolean;
		canDelete: boolean;
	};
	roleHistory: {
		fromRole: string;
		toRole: string;
		changedBy?: Types.ObjectId;
		changedAt: Date;
		reason?: string;
	}[];
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const userSchema = new Schema<IUser>(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
			trim: true,
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			lowercase: true,
			match: [
				/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
				"Invalid email",
			],
		},
		passwordHash: {
			type: String,
			required: [true, "Password is required"],
			select: false,
			minlength: 6,
		},
		role: {
			type: String,
			enum: ["user", "manager", "admin", "super_admin"],
			default: "user",
		},
		isSuperAdmin: {
			type: Boolean,
			default: false,
		},
		categoryPermissions: {
			canCreate: {
				type: Boolean,
				default: false,
			},
			canUpdate: {
				type: Boolean,
				default: false,
			},
			canDelete: {
				type: Boolean,
				default: false,
			},
		},
		roleHistory: [
			{
				fromRole: {
					type: String,
				},
				toRole: {
					type: String,
				},
				changedBy: {
					type: Schema.Types.ObjectId,
					ref: "User",
				},
				changedAt: {
					type: Date,
					default: Date.now,
				},
				reason: {
					type: String,
				},
			},
		],
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
	if (!this.isModified("passwordHash")) {
		return next();
	}

	try {
		const salt = await bcryptjs.genSalt(10);
		this.passwordHash = await bcryptjs.hash(this.passwordHash, salt);
		next();
	} catch (error: any) {
		next(error);
	}
});

// Compare password method
userSchema.methods.comparePassword = async function (password: string) {
	return bcryptjs.compare(password, this.passwordHash);
};

export default model<IUser>("User", userSchema);
