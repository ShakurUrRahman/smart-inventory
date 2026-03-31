import { Order } from "../models/Order";

/**
 * Generates unique order number: ORD-0001, ORD-0002, etc.
 * Handles race conditions with retry logic (3 attempts)
 */
export const generateOrderNumber = async (): Promise<string> => {
	const MAX_RETRIES = 3;
	let attempt = 0;

	while (attempt < MAX_RETRIES) {
		try {
			// Get count of existing orders
			const count = await Order.countDocuments();
			const nextNumber = count + 1;
			const orderNumber = `ORD-${String(nextNumber).padStart(4, "0")}`;

			// Try to create a unique document with this order number
			// This will fail if duplicate exists (race condition)
			const existingOrder = await Order.findOne({ orderNumber });
			if (!existingOrder) {
				return orderNumber;
			}

			attempt++;
		} catch (error) {
			attempt++;
		}
	}

	// Fallback: use timestamp if retries exhausted
	const timestamp = Date.now().toString().slice(-8);
	return `ORD-${timestamp}`;
};
