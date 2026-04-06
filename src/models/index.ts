// Export all models from a single file for cleaner imports

export { Category, type ICategory } from "./Category";

export { Order, type IOrder, type IOrderItem } from "./Order";
export { RestockQueue, type IRestockQueue } from "./RestockQueue";
export { ActivityLog, type IActivityLog } from "./ActivityLog";

/**
 * Usage Example:
 *
 * Instead of:
 * import { User } from "../models/User";
 * import { Product } from "../models/Product";
 *
 * You can now use:
 * import { User, Product } from "../models";
 */
