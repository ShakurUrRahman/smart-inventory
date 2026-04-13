# InventoryOS — Backend

<div align="center">

![InventoryOS](https://img.shields.io/badge/InventoryOS-Backend-6366F1?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)

**A robust REST API for inventory management with full RBAC, approval workflows, and real-time stock tracking.**

[Live API](https://smart-inventory-teal.vercel.app/api/health) · [Frontend Repo](https://github.com/ShakurUrRahman/smart-inventory)

</div>

---

## Overview

InventoryOS Backend is a production-ready Express/TypeScript REST API backed by MongoDB. It implements a comprehensive Role-Based Access Control system with four roles, product approval workflows, automated restock queue management, and detailed activity logging.

---

## Tech Stack

| Category       | Technology             |
| -------------- | ---------------------- |
| Runtime        | Node.js 18+            |
| Framework      | Express.js             |
| Language       | TypeScript 5.9         |
| Database       | MongoDB (Mongoose ODM) |
| Authentication | JWT + bcryptjs         |
| Deployment     | Vercel Serverless      |

---

## Features

### Authentication

- JWT tokens with configurable expiry
- httpOnly cookie + Bearer token support (dual auth)
- Password hashing with bcryptjs (salt rounds: 10)
- Token verification on every protected request via `requireAuth` middleware
- Immediate access revocation — fetches full user from DB on every request (catches demoted/deactivated users instantly)

### Role-Based Access Control (RBAC)

Four-tier role hierarchy:

```
super_admin → admin → manager → user
```

| Role          | Key Permissions                                            |
| ------------- | ---------------------------------------------------------- |
| `super_admin` | All permissions + demote admins + only one exists (seeded) |
| `admin`       | Full CRUD + user management + product/category approval    |
| `manager`     | Orders + restock + categories (with granted permissions)   |
| `user`        | Own products only + view categories                        |

RBAC middleware stack in `rbacMiddleware.ts`:

- `requireAuth` — verifies JWT, fetches full user, checks `isActive`
- `requireRole(...roles)` — checks role against allowed list
- `requireOwnershipOrRole(roles)` — allows if owner OR has role
- `requireCategoryPermission(action)` — per-action category permission check
- `cannotTargetSuperAdmin` — blocks any modification of the super admin
- `preventSelfModification` — prevents modifying your own role

### Products

- Role-based visibility — users see only their own, admin/manager see all approved
- Approval workflow — user-created products start as `pending`, require approval
- Auto status — `active` / `out_of_stock` based on stock level
- Editing approved products (user role) resets to `pending`
- Admin/manager products auto-approved on creation
- Restock queue integration on create/update/restock

### Orders

- Validated status transitions — prevents illegal state jumps:
    ```
    Pending → Confirmed → Shipped → Delivered
           ↘ Cancelled  ↗ Cancelled
    ```
- Stock deduction on order creation
- Stock restoration on cancellation
- Active order check prevents deleting products in open orders

### Restock Queue

- Automatically populated when product stock falls below `minStockThreshold`
- Priority auto-calculated by percentage:
    - `High` — stock = 0 OR ≤ 30% of threshold
    - `Medium` — 31–65% of threshold
    - `Low` — 66–99% of threshold
- Auto-resolved when stock is restocked above threshold
- Role-based visibility — users see only their products' alerts
- Priority counts returned alongside paginated data

### Category Requests

- Managers without category permissions can submit requests
- Admins review and approve/reject with reason
- Approved requests execute the action automatically

### Admin Panel

- User list with role-weight sorting (super_admin first)
- Last 3 role history entries per user
- Role promotion/demotion with full validation
- Category permission toggles (partial update with dot notation `$set`)
- Pending product approval/rejection (min 10-char rejection reason)

### Activity Logging

- Silently logs all significant actions — never breaks main flow
- Batch logging support
- Populated `performedBy` with name and email
- Filterable by entity type

### Dashboard

- Parallel aggregation queries for performance
- 7-day orders and revenue charts with gap-filling (0 for missing days)
- Order status breakdown
- Low stock product summary (sorted by stock ascending)
- Recent activity feed

---

## API Reference

### Auth

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### Products

```
GET    /api/products              # Filtered + paginated
POST   /api/products              # Create (auto-approval by role)
GET    /api/products/:id
PUT    /api/products/:id
DELETE /api/products/:id
PATCH  /api/products/:id/restock
```

### Categories

```
GET    /api/categories
POST   /api/categories
GET    /api/categories/:id
PUT    /api/categories/:id
DELETE /api/categories/:id
```

### Orders

```
GET    /api/orders
POST   /api/orders
GET    /api/orders/:id
PATCH  /api/orders/:id/status
```

### Restock Queue

```
GET    /api/restock
PATCH  /api/restock/:id/resolve
DELETE /api/restock/:id
```

### Admin

```
GET    /api/admin/users
PATCH  /api/admin/users/:id/promote-manager
PATCH  /api/admin/users/:id/promote-admin
PATCH  /api/admin/users/:id/demote-manager
PATCH  /api/admin/users/:id/demote-user
PATCH  /api/admin/users/:id/category-permissions
GET    /api/admin/products/pending
PATCH  /api/admin/products/:id/approve
PATCH  /api/admin/products/:id/reject
```

### Dashboard

```
GET    /api/dashboard/stats
GET    /api/dashboard/orders-chart
GET    /api/dashboard/revenue-chart
GET    /api/dashboard/product-summary
GET    /api/dashboard/order-status-breakdown
GET    /api/dashboard/recent-activity
```

### Activity

```
GET    /api/activity
```

### Utility

```
GET    /api/health
GET    /api/seed               # Seed demo data
GET    /api/seed?force=true    # Drop all + reseed
```

---

## Data Models

### User

```typescript
{
  name, email, passwordHash,
  role: "user" | "manager" | "admin" | "super_admin",
  isSuperAdmin: boolean,
  categoryPermissions: { canCreate, canUpdate, canDelete },
  roleHistory: [{ fromRole, toRole, changedBy, changedAt, reason }],
  isActive: boolean
}
```

### Product

```typescript
{
  name, category, price, stock, minStockThreshold,
  status: "Active" | "Out of Stock",
  approvalStatus: "pending" | "approved" | "rejected",
  approvedBy, approvedAt, rejectedBy, rejectedAt, rejectionReason,
  createdBy
}
```

### Order

```typescript
{
  orderNumber,  // auto-generated e.g. ORD-00042
  customerName,
  items: [{ product, productName, quantity, unitPrice, subtotal }],
  totalPrice,
  status: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled",
  createdBy
}
```

### RestockQueue

```typescript
{
  product, currentStock,
  priority: "High" | "Medium" | "Low",
  isResolved: boolean, resolvedAt
}
```

### ActivityLog

```typescript
{
	(action, entityType, entityId, performedBy, description);
}
```

---

## Project Structure

```
src/
├── app.ts                    # Express app + middleware + routes
├── controllers/
│   ├── authController.ts
│   ├── productController.ts
│   ├── categoryController.ts
│   ├── orderController.ts
│   ├── restockController.ts
│   ├── dashboardController.ts
│   ├── activityController.ts
│   └── adminController.ts
├── middleware/
│   ├── authMiddleware.ts      # Legacy JWT middleware
│   └── rbacMiddleware.ts      # Full RBAC middleware stack
├── models/
│   ├── User.ts
│   ├── Product.ts
│   ├── Category.ts
│   ├── Order.ts
│   ├── RestockQueue.ts
│   ├── ActivityLog.ts
│   └── index.ts
├── routes/
│   ├── authRoutes.ts
│   ├── productRoutes.ts
│   ├── categoryRoutes.ts
│   ├── orderRoutes.ts
│   ├── restockRoutes.ts
│   ├── dashboardRoutes.ts
│   ├── activityRoutes.ts
│   └── adminRoutes.ts
├── utils/
│   ├── activityLogger.ts      # Silent activity logging
│   ├── restockHandler.ts      # Auto restock queue management
│   ├── generateOrderNumber.ts # Sequential order numbers
│   ├── seedDatabase.ts        # Demo data seeding
│   └── seedSuperAdmin.ts      # Super admin seeding
└── types/
    └── express.d.ts           # req.user, req.targetUser, req.product
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
git clone https://github.com/ShakurUrRahman/smart-inventory.git
cd smart-inventory/packages/backend
npm install
```

### Environment Variables

Create `.env` in `packages/backend/`:

```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb+srv://your-cluster.mongodb.net/smart-inventory

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=7d

# Frontend
CLIENT_URL=http://localhost:3000

# Super Admin (used by seedSuperAdmin.ts)
SUPER_ADMIN_EMAIL=superadmin@inventoryos.com
SUPER_ADMIN_PASSWORD=SuperSecurePassword123!
```

### Run Development Server

```bash
npm run dev
# → http://localhost:5000
```

### Seed Demo Data

```bash
# Seed (skips if data exists)
curl http://localhost:5000/api/seed

# Force reseed (drops everything first)
curl http://localhost:5000/api/seed?force=true
```

### Build for Production

```bash
npm run build
```

---

## Deployment (Vercel)

1. Create a new Vercel project pointing to your repo
2. Set **Root Directory** to `packages/backend`
3. Set **Framework Preset** to `Other`
4. Leave Build Command and Output Directory empty
5. Add environment variables (all from `.env` above)
6. Ensure `vercel.json` exists in `packages/backend/`:

```json
{
	"version": 2,
	"builds": [{ "src": "src/app.ts", "use": "@vercel/node" }],
	"routes": [{ "src": "/(.*)", "dest": "src/app.ts" }]
}
```

---

## Key Design Decisions

**Full user fetch on every request** — `requireAuth` fetches the complete user document from MongoDB instead of trusting the JWT payload. This means role changes and account deactivations take effect immediately without waiting for token expiry.

**Upsert pattern for restock queue** — `restockHandler` uses `updateOne` with `$setOnInsert` + `upsert: true` instead of find-then-create. This prevents race conditions and duplicate queue entries.

**Silent activity logging** — `logActivity` wraps all DB writes in try/catch and swallows errors. A logging failure never breaks the main request flow.

**`process.exit` removed** — Vercel serverless functions can't call `process.exit`. The `connectDB` function throws instead, letting the request fail gracefully with a 500.

**`readyState === 1` guard** — `connectDB` skips reconnection if already connected, critical for Vercel's warm-start behavior where the same Node.js instance handles multiple requests.

---

## License

MIT
