# Smart Inventory - Database Models Documentation

## 📋 Overview

This document describes all Mongoose models used in the Smart Inventory system, their structures, relationships, and usage examples.

---

## 📊 Models Overview

| Model            | Purpose                         | Key Fields                                |
| ---------------- | ------------------------------- | ----------------------------------------- |
| **User**         | System users and authentication | name, email, passwordHash, role           |
| **Category**     | Product categories              | name, createdBy                           |
| **Product**      | Inventory products              | name, category, price, stock, status      |
| **Order**        | Customer orders                 | orderNumber, items, totalPrice, status    |
| **RestockQueue** | Low stock alerts                | product, currentStock, priority           |
| **ActivityLog**  | System activity tracking        | action, entityType, entityId, performedBy |

---

## 🔐 User Model

**File:** `src/models/User.ts`

### Schema

```typescript
{
  name: String (required),
  email: String (required, unique, lowercase),
  passwordHash: String (required, min 6),
  role: Enum ['admin', 'manager'] (default: 'manager'),
  timestamps: true
}
```

### Usage

```typescript
import { User } from "../models";

// Create a user
const newUser = await User.create({
	name: "John Doe",
	email: "john@example.com",
	passwordHash: await bcrypt.hash("password", 10),
	role: "manager",
});

// Find by email
const user = await User.findOne({ email: "john@example.com" });

// Update role
await User.updateOne({ _id: userId }, { role: "admin" });
```

---

## 🏷️ Category Model

**File:** `src/models/Category.ts`

### Schema

```typescript
{
  name: String (required, unique),
  createdBy: ObjectId (ref: User, optional),
  timestamps: true
}
```

### Usage

```typescript
import { Category } from "../models";

// Create category
const category = await Category.create({
	name: "Electronics",
	createdBy: userId,
});

// Find all categories
const categories = await Category.find();

// Find with user details
const categories = await Category.find().populate("createdBy", "name email");
```

---

## 📦 Product Model

**File:** `src/models/Product.ts`

### Schema

```typescript
{
  name: String (required),
  category: ObjectId (ref: Category, required),
  price: Number (required, min: 0),
  stock: Number (required, min: 0),
  minStockThreshold: Number (required, min: 1),
  status: Enum ['Active', 'Out of Stock'] (default: 'Active'),
  createdBy: ObjectId (ref: User, optional),
  timestamps: true
}
```

### Usage

```typescript
import { Product } from "../models";

// Create product
const product = await Product.create({
	name: "Laptop",
	category: categoryId,
	price: 999.99,
	stock: 50,
	minStockThreshold: 5,
	status: "Active",
	createdBy: userId,
});

// Find with category details
const products = await Product.find().populate("category");

// Find low stock products
const lowStock = await Product.find({
	stock: { $lt: minStockThreshold },
});

// Update stock
await Product.updateOne(
	{ _id: productId },
	{ stock: product.stock - quantity },
);
```

---

## 🛒 Order Model

**File:** `src/models/Order.ts`

### Schema

```typescript
{
  orderNumber: String (unique, auto-generated like "ORD-1001"),
  customerName: String (required),
  items: [{
    product: ObjectId (ref: Product),
    productName: String (snapshot),
    quantity: Number,
    unitPrice: Number,
    subtotal: Number
  }],
  totalPrice: Number,
  status: Enum ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
  createdBy: ObjectId (ref: User, optional),
  timestamps: true
}
```

### Usage

```typescript
import { Order } from "../models";

// Create order (orderNumber auto-generated)
const order = await Order.create({
	customerName: "Jane Smith",
	items: [
		{
			product: productId,
			productName: "Laptop",
			quantity: 2,
			unitPrice: 999.99,
			subtotal: 1999.98,
		},
	],
	totalPrice: 1999.98,
	status: "Pending",
	createdBy: userId,
});

// Find orders with details
const orders = await Order.find()
	.populate("items.product")
	.populate("createdBy", "name email");

// Update order status
await Order.updateOne({ orderNumber: "ORD-1001" }, { status: "Shipped" });

// Get orders by customer
const customerOrders = await Order.find({ customerName: "Jane Smith" });
```

### Order Number Generation

- Auto-generated in pre-save hook
- Format: `ORD-XXXX` (e.g., ORD-1001, ORD-1002)
- Based on total document count + 1000

---

## 📊 RestockQueue Model

**File:** `src/models/RestockQueue.ts`

### Schema

```typescript
{
  product: ObjectId (ref: Product, unique),
  currentStock: Number,
  threshold: Number,
  priority: Enum ['High', 'Medium', 'Low'] (default: 'Medium'),
  isResolved: Boolean (default: false),
  resolvedAt: Date (default: null),
  timestamps: true
}
```

### Usage

```typescript
import { RestockQueue } from "../models";

// Add to restock queue
const restockItem = await RestockQueue.create({
	product: productId,
	currentStock: 3,
	threshold: 5,
	priority: "High",
});

// Get pending restocks
const pendingRestocks = await RestockQueue.find({ isResolved: false }).populate(
	"product",
	"name stock",
);

// Mark as resolved
await RestockQueue.updateOne(
	{ product: productId },
	{
		isResolved: true,
		resolvedAt: new Date(),
	},
);

// Get high priority items
const highPriority = await RestockQueue.find({
	priority: "High",
	isResolved: false,
});
```

---

## 📝 ActivityLog Model

**File:** `src/models/ActivityLog.ts`

### Schema

```typescript
{
  action: String (required),
  entityType: Enum ['Order', 'Product', 'Stock', 'User', 'Category'],
  entityId: ObjectId,
  performedBy: ObjectId (ref: User),
  createdAt: Date (auto-set)
}
```

### Usage

```typescript
import { ActivityLog } from "../models";

// View activities (usually created via logActivity utility)
const activities = await ActivityLog.find()
	.sort({ createdAt: -1 })
	.populate("performedBy", "name email");

// Get activities for specific entity
const productActivities = await ActivityLog.find({ entityId: productId });

// Get all order-related activities
const orderActivities = await ActivityLog.find({ entityType: "Order" });
```

---

## 🔧 Activity Logger Utility

**File:** `src/utils/activityLogger.ts`

### Functions

#### `logActivity()`

Logs a single activity. Fails silently if error occurs.

```typescript
import { logActivity } from "../utils/activityLogger";

// Log product creation
await logActivity({
	action: "Product Created",
	entityType: "Product",
	entityId: productId,
	userId: currentUserId,
});

// Log order status change
await logActivity({
	action: "Order Status Changed to Shipped",
	entityType: "Order",
	entityId: orderId,
	userId: currentUserId,
});

// Log stock adjustment
await logActivity({
	action: "Stock Reduced by 5",
	entityType: "Stock",
	entityId: productId,
	userId: currentUserId,
});
```

#### `logActivitiesBatch()`

Logs multiple activities at once.

```typescript
await logActivitiesBatch([
	{
		action: "Bulk Import",
		entityType: "Product",
		entityId: product1Id,
		userId: currentUserId,
	},
	{
		action: "Bulk Import",
		entityType: "Product",
		entityId: product2Id,
		userId: currentUserId,
	},
]);
```

#### `getActivityLog()`

Retrieves activities for a specific entity.

```typescript
const activities = await getActivityLog(productId, 10);
// Returns last 10 activities for this product
```

#### `getRecentActivities()`

Gets recent system activities.

```typescript
const recentActivities = await getRecentActivities(20);
// Returns last 20 activities in the system
```

---

## 🔗 Model Relationships

```
User
  ├── One-to-Many: Category (createdBy)
  ├── One-to-Many: Product (createdBy)
  ├── One-to-Many: Order (createdBy)
  └── One-to-Many: ActivityLog (performedBy)

Category
  ├── Many-to-One: User (createdBy)
  └── One-to-Many: Product (category)

Product
  ├── Many-to-One: User (createdBy)
  ├── Many-to-One: Category (category)
  ├── One-to-Many: Order Items (items.product)
  └── One-to-One: RestockQueue (product)

Order
  ├── Many-to-One: User (createdBy)
  ├── One-to-Many: OrderItems (items.product reference)

ActivityLog
  └── Many-to-One: User (performedBy)
```

---

## 📥 Importing Models

### Individual Import

```typescript
import { User } from "../models/User";
import { Product } from "../models/Product";
```

### Bulk Import (Recommended)

```typescript
import { User, Product, Order, Category } from "../models";
```

---

## 🎯 Best Practices

1. **Always use TypeScript interfaces** - Type safety prevents errors
2. **Populate references when needed** - Use `.populate()` for related data
3. **Log activities for audit trail** - Use `logActivity()` for important changes
4. **Validate data before saving** - Mongoose schemas enforce this
5. **Index frequently queried fields** - Add indexes for performance
6. **Handle timestamps properly** - Timestamps are auto-managed
7. **Use unique constraints** - Email, category name, product unique fields
8. **Soft delete pattern** - Consider adding `isDeleted` field for archival

---

## 🚀 Example: Complete Flow

```typescript
import { User, Product, Order, Category, logActivity } from "../models";

// 1. Create category
const category = await Category.create({
	name: "Electronics",
	createdBy: adminUserId,
});
await logActivity({
	action: "Category Created",
	entityType: "Category",
	entityId: category._id,
	userId: adminUserId,
});

// 2. Create product
const product = await Product.create({
	name: "Laptop",
	category: category._id,
	price: 999.99,
	stock: 100,
	minStockThreshold: 10,
	createdBy: adminUserId,
});
await logActivity({
	action: "Product Created",
	entityType: "Product",
	entityId: product._id,
	userId: adminUserId,
});

// 3. Create order
const order = await Order.create({
	customerName: "John Smith",
	items: [
		{
			product: product._id,
			productName: product.name,
			quantity: 2,
			unitPrice: product.price,
			subtotal: product.price * 2,
		},
	],
	totalPrice: product.price * 2,
	createdBy: managerId,
});
await logActivity({
	action: "Order Created",
	entityType: "Order",
	entityId: order._id,
	userId: managerId,
});

// 4. Update product stock
await Product.updateOne({ _id: product._id }, { stock: product.stock - 2 });
await logActivity({
	action: "Stock Reduced by 2",
	entityType: "Stock",
	entityId: product._id,
	userId: managerId,
});
```

---

## 📖 References

- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
