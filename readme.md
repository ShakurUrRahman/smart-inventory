# InventoryOS Backend

A robust, scalable inventory management API built with **Express.js**, **Node.js**, and **TypeScript**. Features complete REST API endpoints with MongoDB database, JWT authentication, real-time activity logging, and intelligent restock queue management.

## 🏗️ Architecture Overview

The backend follows a modular MVC architecture with clear separation of concerns:

```
Request → Middleware (Auth, CORS) → Routes → Controllers → Services/Utils → Database
Response ← Error Handler ← Validation ← Database Operations
```

## 📁 Project Structure

```
packages/backend/
├── src/
│   ├── controllers/
│   │   ├── authController.ts       # Auth: register, login, logout, getMe
│   │   ├── productController.ts    # Products CRUD + restock logic
│   │   ├── categoryController.ts   # Categories CRUD
│   │   ├── orderController.ts      # Orders CRUD + status transitions
│   │   ├── restockController.ts    # Restock queue management
│   │   ├── dashboardController.ts  # Analytics & statistics
│   │   └── activityController.ts   # Activity log retrieval
│   │
│   ├── models/
│   │   ├── User.ts                 # User schema + password hashing
│   │   ├── Product.ts              # Product with category ref
│   │   ├── Category.ts             # Category schema
│   │   ├── Order.ts                # Order with items & pricing
│   │   ├── OrderItem.ts            # Order line items
│   │   ├── RestockQueue.ts         # Restock queue with priority
│   │   ├── ActivityLog.ts          # Activity tracking
│   │   ├── InventoryItem.ts        # Inventory snapshot
│   │   └── index.ts                # Model exports
│   │
│   ├── routes/
│   │   ├── authRoutes.ts           # /api/auth
│   │   ├── productRoutes.ts        # /api/products
│   │   ├── categoryRoutes.ts       # /api/categories
│   │   ├── orderRoutes.ts          # /api/orders
│   │   ├── restockRoutes.ts        # /api/restock
│   │   ├── dashboardRoutes.ts      # /api/dashboard
│   │   ├── activityRoutes.ts       # /api/activity
│   │   ├── inventoryRoutes.ts      # /api/inventory
│   │   └── index.ts                # Route aggregation
│   │
│   ├── middleware/
│   │   ├── authMiddleware.ts       # JWT verification + cookie parsing
│   │   ├── roleMiddleware.ts       # Role-based access control
│   │   └── errorHandler.ts         # Global error handling
│   │
│   ├── utils/
│   │   ├── activityLogger.ts       # Log activities to DB
│   │   ├── restockHandler.ts       # Restock queue logic
│   │   ├── generateOrderNumber.ts  # Order ID generation
│   │   ├── seedDatabase.ts         # Demo data seeding
│   │   └── database.ts             # MongoDB connection
│   │
│   ├── config/
│   │   ├── env.ts                  # Environment variables
│   │   └── constants.ts            # App constants
│   │
│   ├── types/
│   │   ├── express.d.ts            # Express type augmentation
│   │   └── index.ts                # Type definitions
│   │
│   └── app.ts                      # Express app setup
│
├── .env                            # Environment variables
├── .env.example                    # Env template
├── tsconfig.json                   # TypeScript config
├── package.json                    # Dependencies & scripts
└── README.md                       # This file
```

## 🚀 Key Features

### Authentication & Authorization

- **JWT Authentication**: Token-based with httpOnly cookies
- **Password Hashing**: bcrypt with salt rounds
- **Role-Based Access**: Admin, Manager, User roles
- **Session Persistence**: Cookie-based token storage
- **Auto-logout**: 401 responses handled by client

### Product Management

- **Full CRUD**: Create, read, update, delete products
- **Category Association**: Products linked to categories
- **Stock Tracking**: Real-time stock levels with thresholds
- **Status Management**: Active/Inactive product states
- **Restock Triggers**: Auto-queue when stock < threshold
- **Activity Logging**: All product changes tracked

### Category Management

- **Simple CRUD**: Create, read, update, delete categories
- **Product Count**: Track products per category
- **Duplicate Prevention**: Unique category names
- **Cascade Operations**: Safe deletion with checks

### Order Management

- **Order Creation**: Add multiple items in single order
- **Status Workflow**: Pending → Confirmed → Shipped → Delivered
- **Order Cancellation**: Restore stock on cancel
- **Price Snapshots**: Store item prices at order time
- **Order Expansion**: Detailed order with items breakdown
- **Pagination**: 10 items per page with navigation
- **Filter & Search**: By customer name, status, date

### Restock Queue

- **Intelligent Priority**: High/Medium/Low based on stock level
    - High: Stock = 0
    - Medium: Stock ≤ 50% of threshold
    - Low: Stock > 50% but < 100% of threshold
- **Automatic Management**: Auto-created when product stock < threshold
- **Threshold Comparison**: Current vs required stock display
- **Resolve & Remove**: Restock items or remove from queue
- **E11000 Fix**: Handles duplicate key errors with deleteMany before upsert
- **Queue Cleanup**: Auto-remove when stock ≥ threshold

### Activity Logging

- **Comprehensive Tracking**: All CRUD operations logged
- **User Attribution**: Who performed each action
- **Entity Types**: Order, Product, Stock, User, Category
- **Timestamps**: Automatic created/updated dates
- **Description Field**: Detailed action descriptions
- **Search & Filter**: By entity type, date, user
- **Pagination**: Browse activity history

### Dashboard Analytics

- **Today's Statistics**: Orders, revenue, pending count
- **7-Day Charts**: Order and revenue trends
- **Status Breakdown**: Donut chart data for all statuses
- **Product Summary**: Stock levels with categories
- **Low Stock Alerts**: Count of products needing restock
- **Recent Activity**: Last 100 activities with pagination

### Seed Data

- **Demo Users**: admin@inventory.com, manager@inventory.com
- **Demo Categories**: 5 categories
- **Demo Products**: 15 products with varied stock levels
- **Demo Orders**: 10 sample orders with items
- **Auto-Queue**: Restock queue auto-populated from products
- **Idempotent**: Check if seeded before creating

## 🛠️ Technologies

| Category           | Tools                     |
| ------------------ | ------------------------- |
| **Runtime**        | Node.js 18+               |
| **Framework**      | Express.js 4.x            |
| **Language**       | TypeScript                |
| **Database**       | MongoDB Atlas / Local     |
| **ODM**            | Mongoose 7.x              |
| **Authentication** | JWT, bcryptjs             |
| **Validation**     | Zod, custom validators    |
| **Utilities**      | date-fns, lodash          |
| **Environment**    | dotenv                    |
| **Logging**        | Console (can add winston) |

## 📦 Dependencies

```json
{
	"express": "^4.18.0",
	"mongoose": "^7.x",
	"jsonwebtoken": "^9.x",
	"bcryptjs": "^2.x",
	"dotenv": "^16.x",
	"cors": "^2.x",
	"cookie-parser": "^1.x",
	"zod": "^3.x",
	"date-fns": "^2.x",
	"lodash": "^4.x"
}
```

## 🔐 Security Features

- **Password Hashing**: bcryptjs with 10 salt rounds
- **JWT Tokens**: 24-hour expiration
- **HttpOnly Cookies**: Not accessible from JavaScript
- **CORS Protection**: Configured with specific origins
- **Input Validation**: Zod schemas for all inputs
- **Error Hiding**: Generic error messages to clients
- **Request Size Limits**: Prevent payload attacks
- **SQL Injection Prevention**: Mongoose prevents injection
- **Rate Limiting**: Can be added with express-rate-limit
- **Environment Variables**: Sensitive data in .env

## 📊 Database Schema

### User

```typescript
{
  _id: ObjectId,
  name: string,
  email: string (unique),
  passwordHash: string (select: false),
  role: "admin" | "manager" | "user",
  createdAt: Date,
  updatedAt: Date
}
```

### Product

```typescript
{
  _id: ObjectId,
  name: string,
  category: ObjectId (ref: Category),
  price: number,
  stock: number,
  minStockThreshold: number,
  status: "Active" | "Inactive",
  createdAt: Date,
  updatedAt: Date
}
```

### Category

```typescript
{
  _id: ObjectId,
  name: string (unique),
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Order

```typescript
{
  _id: ObjectId,
  orderNumber: string (ORD-0001 format),
  customerName: string,
  items: OrderItem[],
  totalPrice: number,
  status: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled",
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### OrderItem

```typescript
{
  productId: ObjectId,
  productName: string,
  quantity: number,
  unitPrice: number,
  subtotal: number
}
```

### RestockQueue

```typescript
{
  _id: ObjectId,
  product: ObjectId (ref: Product, unique),
  currentStock: number,
  threshold: number,
  priority: "High" | "Medium" | "Low",
  isResolved: boolean,
  requestedAt: Date,
  resolvedAt: Date (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### ActivityLog

```typescript
{
  _id: ObjectId,
  action: string,
  entityType: "Order" | "Product" | "Stock" | "User" | "Category",
  entityId: ObjectId (optional),
  description: string (optional),
  performedBy: ObjectId (ref: User),
  createdAt: Date
}
```

## 🔌 API Endpoints

### Authentication

```
POST   /api/auth/register        - Register new user
POST   /api/auth/login           - Login user
POST   /api/auth/logout          - Logout (clear cookie)
GET    /api/auth/me              - Get current user profile
```

### Products

```
GET    /api/products             - Get all products (search, filter, pagination)
POST   /api/products             - Create product
GET    /api/products/:id         - Get product by ID
PATCH  /api/products/:id         - Update product (name, price, threshold, category)
DELETE /api/products/:id         - Delete product
PATCH  /api/products/:id/restock - Increase stock
```

### Categories

```
GET    /api/categories           - Get all categories with product count
POST   /api/categories           - Create category
GET    /api/categories/:id       - Get category by ID
PATCH  /api/categories/:id       - Update category
DELETE /api/categories/:id       - Delete category
```

### Orders

```
GET    /api/orders               - Get all orders (filter, search, pagination)
POST   /api/orders               - Create order with items
GET    /api/orders/:id           - Get order details
PATCH  /api/orders/:id/status    - Update order status
DELETE /api/orders/:id           - Delete order (soft/hard)
```

### Restock Queue

```
GET    /api/restock              - Get restock queue (filter by priority)
PATCH  /api/restock/:id/resolve  - Resolve restock item (add stock)
DELETE /api/restock/:id          - Remove from queue
```

### Dashboard

```
GET    /api/dashboard/stats      - Statistics (orders today, revenue, etc.)
GET    /api/dashboard/orders-chart    - Last 7 days orders
GET    /api/dashboard/revenue-chart   - Last 7 days revenue
GET    /api/dashboard/product-summary - Top products by stock
GET    /api/dashboard/status-breakdown - Order status counts
GET    /api/dashboard/activity   - Recent activity (last 100)
```

### Activity Log

```
GET    /api/activity             - Activity logs (filter, pagination)
```

### Inventory

```
GET    /api/inventory            - Inventory items
GET    /api/inventory/:id        - Inventory item details
```

### Utilities

```
GET    /api/health               - Health check (DB connection status)
GET    /api/seed                 - Seed database with demo data
```

## 🔄 Request/Response Format

### Successful Response

```json
{
	"success": true,
	"data": {
		/* ... */
	},
	"message": "Operation successful"
}
```

### Error Response

```json
{
	"success": false,
	"message": "User not found",
	"error": "NOT_FOUND"
}
```

### Paginated Response

```json
{
	"success": true,
	"data": [
		/* ... */
	],
	"total": 50,
	"page": 1,
	"totalPages": 5,
	"limit": 10
}
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
cd packages/backend
npm install
```

### Environment Setup

Create `.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/smart-inventory
# OR for Atlas:
# MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/smart-inventory

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# CORS
CLIENT_URL=http://localhost:3000

# Seed Data
SEED_ON_START=false
```

### Development

```bash
npm run dev
```

Server runs on `http://localhost:5000`

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

### Database Seeding

```bash
curl http://localhost:5000/api/seed
```

Or set `SEED_ON_START=true` in `.env`

## 📝 Key Implementation Details

### Restock Queue Logic

The `handleRestockCheck` function is called after every product operation:

```typescript
if (product.stock < product.minStockThreshold) {
	// Delete resolved entries first (prevents E11000 errors)
	await RestockQueue.deleteMany({
		product: product._id,
		isResolved: true,
	});

	// Upsert unresolved entry
	await RestockQueue.updateOne(
		{ product: product._id, isResolved: false },
		{
			product: product._id,
			currentStock: product.stock,
			threshold: product.minStockThreshold,
			priority: calculatePriority(product.stock, threshold),
			isResolved: false,
		},
		{ upsert: true },
	);
} else {
	// Stock >= threshold, clean up queue
	await RestockQueue.deleteMany({
		product: product._id,
		isResolved: false,
	});
}
```

### Activity Logging

All CRUD operations are logged:

```typescript
await logActivity({
	action: "Product Created",
	entityType: "Product",
	entityId: product._id,
	userId: req.user.userId,
	description: `Product '${name}' added to inventory`,
});
```

### Order Status Transitions

```
Pending → Confirmed (or Cancelled)
Confirmed → Shipped (or Cancelled)
Shipped → Delivered
Delivered/Cancelled → (locked, no transitions)
```

### Password Hashing

```typescript
const salt = await bcryptjs.genSalt(10);
const hash = await bcryptjs.hash(password, salt);
```

## 🧪 Testing

### Test with cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@inventory.com","password":"demo123"}'

# Get products
curl -X GET http://localhost:5000/api/products \
  -H "Cookie: token=<your_token>"

# Create product
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<your_token>" \
  -d '{"name":"Product","category":"<id>","price":10,"stock":20,"minStockThreshold":5}'
```

### Test with Postman

1. Import API collection
2. Set environment variables:
    - `base_url`: http://localhost:5000
    - `token`: (auto-set after login)
3. Run requests

## 🐛 Common Issues

### MongoDB Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`

### JWT Token Invalid

```
Error: jwt malformed
```

- Verify `JWT_SECRET` matches between server instances
- Check token is in cookies or Authorization header

### E11000 Duplicate Key Error

```
Error: E11000 duplicate key error
```

- Fixed in restock handler (deleteMany before upsert)
- For custom indexes, check database

### Product Deletion Fails

```
Error: Cannot delete product with active orders
```

- Delete related orders first
- Or implement soft delete

## 📈 Performance Optimization

- **Database Indexing**: Product category, User email, Order status
- **Query Optimization**: Lean queries where fields not needed
- **Pagination**: Default 10 items per page
- **Caching**: Can add Redis for session/data caching
- **Batching**: Seed uses insertMany for bulk operations

## 🔄 Data Flow Example: Create Order

```
1. POST /api/orders
   ↓
2. Validate items (check product exists, stock available)
   ↓
3. Deduct stock from each product
   ↓
4. Call handleRestockCheck for each product
   ↓
5. Create order with items
   ↓
6. Log activity
   ↓
7. Return order with status 201
```

## 📊 Monitoring

Add logging for:

- Request duration
- Error rates
- Database query times
- API endpoint usage

Example with winston:

```typescript
logger.info(`${req.method} ${req.path}`, {
	duration: Date.now() - startTime,
	status: res.statusCode,
});
```

## 🚢 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/smart-inventory
JWT_SECRET=<generate-strong-secret>
CLIENT_URL=https://yourdomain.com
```

### Deployment Options

- **Heroku**: Procfile + buildpack
- **Railway/Render**: Git push deploy
- **AWS EC2**: Node + PM2 + Nginx
- **Docker**: Containerize with Dockerfile

### Pre-deployment Checklist

- [ ] All environment variables set
- [ ] Database indexes created
- [ ] CORS origins configured
- [ ] JWT secret changed
- [ ] Error logging enabled
- [ ] Rate limiting added
- [ ] HTTPS enforced
- [ ] Health check endpoint working

## 📄 License

MIT

## 👨‍💻 Author

**Shakur** - Full-Stack Web Developer

- Location: Dhaka, Bangladesh
- Stack: Node.js, Express, MongoDB, Next.js
- Email: shakururrahman@gmail.com

---

**Built with ❤️ using Express.js & TypeScript**


