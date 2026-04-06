// src/types/express.d.ts
import { IUser } from "../models/User";
import { IProduct } from "../models/Product";

declare global {
	namespace Express {
		interface Request {
			user?: any;
			product?: IProduct;
			targetUser?: IUser;
		}
	}
}

export {}; // ← must have this
