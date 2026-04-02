import { RestockQueue } from "../models/RestockQueue";

export const handleRestockCheck = async (product: any) => {
	try {
		if (!product || !product._id) {
			console.error("Invalid product for restock check");
			return;
		}

		if (product.stock < product.minStockThreshold) {
			let priority: "High" | "Medium" | "Low" = "Low";

			if (product.stock === 0) {
				priority = "High";
			} else if (product.stock <= product.minStockThreshold / 2) {
				priority = "Medium";
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
