import { RestockQueue } from "../models/RestockQueue";

export const handleRestockCheck = async (product: any) => {
	try {
		if (!product || !product._id) {
			console.error("Invalid product for restock check");
			return;
		}

		if (product.stock < product.minStockThreshold) {
			const percentage =
				(product.stock / product.minStockThreshold) * 100;

			let priority: "High" | "Medium" | "Low" = "Low";

			if (product.stock === 0 || percentage <= 30) {
				// Critical: Out of stock OR 25% or less of the minimum needed
				priority = "High";
			} else if (percentage <= 65) {
				// Warning: Between 25% and 75% of the minimum
				priority = "Medium";
			} else {
				// Healthy: Above 75% of the minimum
				priority = "Low";
			}

			// Delete old resolved entries
			await RestockQueue.deleteMany({
				product: product._id,
				isResolved: true,
			});

			// Upsert — only use fields that exist in your schema
			await RestockQueue.updateOne(
				{ product: product._id, isResolved: false },
				{
					$set: {
						currentStock: product.stock,
						priority,
					},
					$setOnInsert: {
						product: product._id,
						isResolved: false,
						resolvedAt: null,
					},
				},
				{ upsert: true },
			);
		} else {
			// Stock is fine — remove from queue
			await RestockQueue.deleteMany({
				product: product._id,
				isResolved: false,
			});
		}
	} catch (error: any) {
		console.error("Error in handleRestockCheck:", error.message);
	}
};
