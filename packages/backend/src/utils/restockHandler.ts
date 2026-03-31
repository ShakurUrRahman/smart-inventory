import { RestockQueue } from "../models/RestockQueue";

export const handleRestockCheck = async (product: any) => {
	if (product.stock < product.minStockThreshold) {
		let priority: "High" | "Medium" | "Low" = "Low";
		if (product.stock === 0) {
			priority = "High";
		} else if (product.stock <= product.minStockThreshold / 2) {
			priority = "Medium";
		}

		await RestockQueue.findOneAndUpdate(
			{ product: product._id, isResolved: false },
			{
				$set: {
					currentStock: product.stock,
					priority,
				},
				$setOnInsert: {
					// ← only set these when CREATING a new document
					product: product._id,
					isResolved: false,
					resolvedAt: null,
				},
			},
			{ upsert: true, new: true },
		);
	} else {
		await RestockQueue.findOneAndUpdate(
			{ product: product._id, isResolved: false },
			{
				$set: {
					isResolved: true,
					resolvedAt: new Date(),
				},
			},
		);
	}
};
