# 🏭 Smart Inventory & Order Management System - Backend

A production-ready Node.js/Express backend for inventory management with role-based access control, product approval workflows, real-time stock monitoring, and comprehensive activity logging.

**API Base URL:** `http://localhost:5000/api`  
**Frontend Repository:** [smart-inventory-frontend](link)  
**Tech Stack:** Node.js | Express | MongoDB | Mongoose | JWT | TypeScript

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [Authentication](#authentication)
9. [RBAC Middleware](#rbac-middleware)
10. [Project Structure](#project-structure)
11. [Key Controllers & Logic](#key-controllers--logic)
12. [Error Handling](#error-handling)
13. [Development Guide](#development-guide)
14. [Deployment](#deployment)
15. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

**Smart Inventory Backend** is a comprehensive REST API that powers the Smart Inventory Management System. It handles all business logic for inventory management, user authentication, product approval workflows, restock queue management, and role-based access control.

### Core Responsibilities:

- 🔐 **Authentication & JWT** - Secure user login with HTTP-only cookies
- 🛡️ **Authorization (RBAC)** - 4 roles with granular permissions
- 📦 **Product Management** - CRUD operations with approval workflows
- 📊 **Stock Monitoring** - Real-time restock queue management
- 👥 **User Management** - Admin tools for user and role management
- 📝 **Activity Logging** - Comprehensive audit trail of all actions
- 🔔 **Notifications** - Real-time status updates (Pending → Approved)

---

## ✨ Features

### 🔐 Authentication & Security

- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **HTTP-Only Cookies** - Token stored securely (CSRF protection)
- ✅ **Password Hashing** - BCrypt for password security
- ✅ **Token Refresh** - Optional auto-refresh mechanism
- ✅ **CORS Configuration** - Restricted to frontend origin

### 👥 Role-Based Access Control (RBAC)

Four distinct roles with escalating permissions:

```
User (Regular User)
├── Create own products
├── Edit/Delete own products
├── View own products only
├── Restock own products
└── View own activity

Manager
├── All User permissions +
├── View ALL products
├── Edit/Delete ANY product
├── Restock ANY product
├── Approve/Reject pending products
├── Grant category permissions
└── View all activity

Admin
├── All Manager permissions +
├── User management
├── Role assignment
└── System-wide analytics

Super Admin
└── Unlimited access to everything
```

### 📦 Product Management

- ✅ **Product Submission** - Users submit products for approval
- ✅ **Approval Workflow** - Managers/Admins approve or reject with reasons
- ✅ **Status Tracking** - Approved, Pending, Rejected states
- ✅ **Ownership Validation** - Users can only manage own products
- ✅ **Category Permissions** - Granular control per manager per category
- ✅ **Image Support** - Cloudinary integration for product images

### 📊 Stock Management

- ✅ **Real-Time Monitoring** - Auto-detect low stock
- ✅ **Restock Queue** - Prioritize items by stock level
- ✅ **Priority Calculation** - High/Medium/Low based on thresholds
- ✅ **Restock Resolution** - Update stock when items restocked
- ✅ **User-Based Filtering** - Users see own, managers see all

### 📝 Activity Logging

- ✅ **Comprehensive Audit Trail** - All actions logged
- ✅ **User Attribution** - Track who did what
- ✅ **Timestamp Tracking** - When actions occurred
- ✅ **Entity Tracking** - Which product/user affected
- ✅ **Description Logging** - Detailed action descriptions

### 🗂️ Category Management

- ✅ **CRUD Operations** - Create, read, update, delete
- ✅ **Manager Permissions** - Per-manager permission toggles
- ✅ **Global Permissions** - Create/Update/Delete controls
- ✅ **Admin Override** - Admins bypass all restrictions

---

## 🏗️ Architecture

### Backend Stack

```
Express.js (HTTP Server)
├── Authentication (JWT + Cookies)
├── Authorization (RBAC Middleware)
├── Routes (REST API Endpoints)
├── Controllers (Business Logic)
├── Models (Mongoose Schemas)
├── Middleware (Auth, Validation, Error)
├── Utils (Helpers, Validators)
└── Database (MongoDB)
```

### Request Flow

```
HTTP Request
   ↓
CORS Middleware
   ↓
Authentication (requireAuth)
   ↓
Authorization (requireRole / requireOwnershipOrRole)
   ↓
Controller Logic
   ↓
Database Query
   ↓
Response + Activity Log
   ↓
HTTP Response (JSON)
```

### Authentication Flow

```
1. User POSTs /auth/login with email/password
   ↓
2. Backend validates credentials against User model
   ↓
3. Password compared with hashed version (bcrypt)
   ↓
4. JWT generated (signed with JWT_SECRET)
   ↓
5. Token sent as HTTP-Only Cookie + JSON response
   ↓
6. Frontend stores token in authStore (Zustand)
   ↓
7. Future requests: Token in Cookie → Validated by middleware
```

### Database Architecture

```
MongoDB (NoSQL)
├── Users Collection
│   ├── Email (unique)
│   ├── Password (hashed)
│   ├── Role (user/manager/admin/super_admin)
│   ├── Category Permissions
│   └── Timestamps
├── Products Collection
│   ├── Name, Description, Price
│   ├── Stock, Min Threshold
│   ├── Category Reference
│   ├── Created By (User reference)
│   ├── Approval Status
│   ├── Rejection Reason (optional)
│   └── Timestamps
├── Categories Collection
│   ├── Name
│   ├── Description
│   └── Timestamps
├── RestockQueue Collection
│   ├── Product Reference
│   ├── Current Stock
│   ├── Priority (High/Medium/Low)
│   ├── Is Resolved
│   └── Timestamps
├── Orders Collection (Optional)
├── ActivityLog Collection
│   ├── User Reference
│   ├── Action
│   ├── Entity Type (Product/User/Order)
│   ├── Entity ID
│   ├── Description
│   └── Timestamp
└── Indexes (for optimization)
```

---

## 🚀 Installation

### Prerequisites

- Node.js 18+
- MongoDB (Atlas or local)
- npm or yarn
- Git

### Step-by-Step Setup

1. **Clone Repository**

```bash
git clone <repository-url>
cd smart-inventory/packages/backend
```

2. **Install Dependencies**

```bash
npm install
```

3. **Setup Environment Variables**
   Create `.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/smart-inventory
# OR for MongoDB Atlas
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/smart-inventory

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_EXPIRE=7d

# CORS
CLIENT_URL=http://localhost:3000

# Cloudinary (Optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. **Initialize Database**

```bash
# Seed sample data
curl http://localhost:5000/api/seed

# Force reseed (deletes all data)
curl http://localhost:5000/api/seed?force=true
```

5. **Run Development Server**

```bash
npm run dev
```

Server runs on `http://localhost:5000`

6. **Verify Setup**

```bash
curl http://localhost:5000/api/health

# Response:
# {
#   "status": "ok",
#   "timestamp": "2026-04-12T...",
#   "database": "connected"
# }
```

---

## ⚙️ Configuration

### Environment Variables

| Variable                | Description           | Required | Example                                     |
| ----------------------- | --------------------- | -------- | ------------------------------------------- |
| `PORT`                  | Server port           | No       | `5000`                                      |
| `NODE_ENV`              | Environment           | No       | `development`                               |
| `MONGODB_URI`           | Database URL          | Yes      | `mongodb://localhost:27017/smart-inventory` |
| `JWT_SECRET`            | JWT signing key       | Yes      | `your_secret_key_min_32_chars`              |
| `JWT_EXPIRE`            | Token expiration      | No       | `7d`                                        |
| `CLIENT_URL`            | Frontend URL (CORS)   | Yes      | `http://localhost:3000`                     |
| `CLOUDINARY_CLOUD_NAME` | Image upload service  | No       | `your_cloud_name`                           |
| `CLOUDINARY_API_KEY`    | Cloudinary API key    | No       | `your_api_key`                              |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | No       | `your_api_secret`                           |

### Database Connection

```typescript
// src/app.ts
export const connectDB = async () => {
	try {
		if (mongoose.connection.readyState === 1) return;

		const mongoUri =
			process.env.MONGODB_URI ||
			"mongodb://localhost:27017/smart-inventory";

		await mongoose.connect(mongoUri, {
			serverSelectionTimeoutMS: 10000,
		});

		console.log("✅ MongoDB connected successfully");
	} catch (error) {
		console.error("❌ MongoDB connection error:", error);
		throw error;
	}
};
```

---

## 📊 Database Schema

### User Schema

```typescript
interface IUser {
	_id: ObjectId;
	name: string;
	email: string; // Unique
	password: string; // Hashed
	role: "user" | "manager" | "admin" | "super_admin";
	isSuperAdmin: boolean; // Derived from role
	isActive: boolean;
	categoryPermissions: {
		canCreate: boolean;
		canUpdate: boolean;
		canDelete: boolean;
	};
	createdAt: Date;
	updatedAt: Date;
}
```

### Product Schema

```typescript
interface IProduct {
	_id: ObjectId;
	name: string;
	description: string;
	category: ObjectId; // Ref: Category
	price: number;
	stock: number;
	minStockThreshold: number;
	status: "Active" | "Out of Stock";
	approvalStatus: "approved" | "pending" | "rejected";
	rejectionReason?: string;
	createdBy: ObjectId; // Ref: User
	image?: string; // Cloudinary URL
	createdAt: Date;
	updatedAt: Date;
}
```

### Category Schema

```typescript
interface ICategory {
	_id: ObjectId;
	name: string;
	description?: string;
	createdAt: Date;
	updatedAt: Date;
}
```

### RestockQueue Schema

```typescript
interface IRestockQueue {
	_id: ObjectId;
	product: ObjectId; // Ref: Product
	currentStock: number;
	priority: "High" | "Medium" | "Low";
	isResolved: boolean;
	requestedAt: Date;
	resolvedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}
```

### ActivityLog Schema

```typescript
interface IActivityLog {
	_id: ObjectId;
	userId: ObjectId; // Ref: User
	action: string; // e.g., 'Product Created', 'Product Approved'
	entityType: string; // 'Product', 'User', 'Order'
	entityId: ObjectId;
	description: string;
	metadata?: Record<string, any>;
	createdAt: Date;
}
```

---

## 🔌 API Endpoints

### 🔐 Authentication Routes

#### Login

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@inventory.com",
  "password": "password123"
}

Response (200):
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "user@inventory.com",
    "role": "user",
    "isSuperAdmin": false,
    "categoryPermissions": { "canCreate": false, "canUpdate": false, "canDelete": false },
    "isActive": true,
    "createdAt": "..."
  }
}
```

#### Logout

```
POST /api/auth/logout

Response (200):
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### Get Current User

```
GET /api/auth/me
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "user": { ... }
}
```

---

### 📦 Products Routes

#### Get All Products

```
GET /api/products?search=&category=&status=&approvalStatus=&page=1&limit=10
Authorization: Bearer <token>

Query Parameters:
- search (string): Filter by product name
- category (string): Filter by category ID
- status (string): "Active" or "Out of Stock"
- approvalStatus (string): "approved", "pending", or "rejected"
- page (number): Page number (default: 1)
- limit (number): Items per page (default: 10)

Response (200):
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Product Name",
      "category": { "_id": "...", "name": "Electronics" },
      "price": 99.99,
      "stock": 50,
      "status": "Active",
      "approvalStatus": "approved",
      "createdBy": {
        "_id": "...",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdAt": "2026-04-12T10:30:00Z"
    }
  ],
  "total": 45,
  "page": 1,
  "totalPages": 5,
  "limit": 10
}

Access Control:
- Users: See only own products
- Managers/Admins: See all products
```

#### Get Single Product

```
GET /api/products/:id
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": { ... }
}
```

#### Create Product

```
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Product",
  "description": "Product description",
  "category": "category_id",
  "price": 99.99,
  "stock": 50,
  "minStockThreshold": 10,
  "image": "url_or_file"
}

Response (201):
{
  "success": true,
  "data": {
    "_id": "...",
    "approvalStatus": "pending",
    "createdBy": "user_id",
    ...
  },
  "message": "Product created and submitted for approval"
}

Access Control:
- All authenticated users can create
- Requires at least 'user' role
```

#### Update Product

```
PUT /api/products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "price": 129.99,
  ...
}

Response (200):
{
  "success": true,
  "data": {
    "approvalStatus": "pending",  // Reset to pending if was approved
    ...
  },
  "message": "Product updated, requires re-approval"
}

Middleware:
- requireOwnershipOrRole(['user', 'admin', 'manager', 'super_admin'])
- Owner can update own; managers/admins can update any
```

#### Delete Product

```
DELETE /api/products/:id
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Product deleted successfully"
}

Middleware:
- requireOwnershipOrRole(['user', 'admin', 'manager', 'super_admin'])
- Owner can delete own; managers/admins can delete any
```

#### Restock Product

```
PATCH /api/products/:id/restock
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 25
}

Response (200):
{
  "success": true,
  "data": {
    "_id": "...",
    "stock": 75,  // Updated stock
    ...
  },
  "message": "Product restocked successfully"
}

Middleware:
- requireOwnershipOrRole(['user', 'admin', 'manager', 'super_admin'])
- Updates product.stock immediately
```

---

### 📊 Restock Routes

#### Get Restock Queue

```
GET /api/restock?priority=&page=1&limit=10
Authorization: Bearer <token>

Query Parameters:
- priority (string): "High", "Medium", or "Low"
- page (number): Page number (default: 1)
- limit (number): Items per page (default: 10)

Response (200):
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "product": {
        "_id": "...",
        "name": "Product Name",
        "stock": 5,
        "minStockThreshold": 10,
        "createdBy": { ... }
      },
      "currentStock": 5,
      "priority": "High",
      "isResolved": false,
      "createdAt": "..."
    }
  ],
  "total": 15,
  "page": 1,
  "totalPages": 2,
  "limit": 10,
  "priorityCounts": {
    "All": 15,
    "High": 5,
    "Medium": 7,
    "Low": 3
  }
}

Access Control:
- Users: See only restock items for products they created
- Managers/Admins: See all restock items
```

#### Resolve Restock Item

```
PATCH /api/restock/:id/resolve
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 50
}

Response (200):
{
  "success": true,
  "message": "Restock item resolved",
  "data": { ... }
}

Effects:
- Updates product.stock += quantity
- Sets isResolved = true
- Logs activity
- Middleware: requireOwnershipOrRole(['user', 'admin', 'manager', 'super_admin'])
```

#### Remove from Queue

```
DELETE /api/restock/:id
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Item removed from queue"
}

Effects:
- Deletes RestockQueue item
- Does NOT update product stock
- Middleware: requireOwnershipOrRole(['user', 'admin', 'manager', 'super_admin'])
```

---

### 🏷️ Categories Routes

#### Get All Categories

```
GET /api/categories
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Electronics",
      "description": "...",
      "createdAt": "..."
    }
  ]
}
```

#### Create Category

```
POST /api/categories
Authorization: Bearer <token>
Middleware: requireRole('admin', 'super_admin')

{
  "name": "New Category",
  "description": "Category description"
}

Response (201):
{
  "success": true,
  "data": { ... }
}
```

#### Update Category

```
PUT /api/categories/:id
Authorization: Bearer <token>
Middleware: requireRole('admin', 'super_admin')

{
  "name": "Updated Name",
  "description": "Updated description"
}

Response (200):
{
  "success": true,
  "data": { ... }
}
```

#### Delete Category

```
DELETE /api/categories/:id
Authorization: Bearer <token>
Middleware: requireRole('admin', 'super_admin')

Response (200):
{
  "success": true,
  "message": "Category deleted"
}
```

---

### 👥 Admin Routes

#### Get All Users

```
GET /api/admin/users
Authorization: Bearer <token>
Middleware: requireRole('admin', 'super_admin')

Response (200):
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Manager Name",
      "email": "manager@inventory.com",
      "role": "manager",
      "isActive": true,
      "categoryPermissions": { ... },
      "createdAt": "..."
    }
  ]
}
```

#### Update User Role

```
PATCH /api/admin/users/:id/role
Authorization: Bearer <token>
Middleware: requireRole('admin', 'super_admin'), cannotTargetSuperAdmin

{
  "role": "manager"
}

Response (200):
{
  "success": true,
  "message": "User role updated to manager",
  "user": { ... }
}

Validation:
- Cannot change super_admin role
- Cannot demote admin to manager/user (only super_admin can)
```

#### Update Category Permissions

```
PATCH /api/admin/users/:id/category-permissions
Authorization: Bearer <token>
Middleware: requireRole('admin', 'super_admin'), cannotTargetSuperAdmin

{
  "canCreate": true,
  "canUpdate": true,
  "canDelete": false
}

Response (200):
{
  "success": true,
  "message": "Permissions updated for Manager Name",
  "categoryPermissions": { ... }
}

Usage:
- Grants/revokes global permission to manager for ALL categories
- canCreate: Can create products in all categories
- canUpdate: Can update products in all categories
- canDelete: Can delete products in all categories
```

#### Get Activity Logs

```
GET /api/activity?userId=&action=&limit=50
Authorization: Bearer <token>
Middleware: requireRole('admin', 'super_admin')

Query Parameters:
- userId (string): Filter by user ID
- action (string): Filter by action type
- limit (number): Max results (default: 50)

Response (200):
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "userId": { "_id": "...", "name": "John Doe", "email": "..." },
      "action": "Product Approved",
      "entityType": "Product",
      "entityId": "...",
      "description": "Product 'Laptop' approved for sale",
      "createdAt": "2026-04-12T10:30:00Z"
    }
  ]
}
```

---

### ✅ Approval Routes (Admin Only)

#### Approve Product

```
PATCH /api/admin/products/:id/approve
Authorization: Bearer <token>
Middleware: requireRole('admin', 'manager', 'super_admin')

Response (200):
{
  "success": true,
  "message": "Product approved successfully",
  "product": {
    "_id": "...",
    "approvalStatus": "approved",
    "rejectionReason": null,
    ...
  }
}

Effects:
- Sets approvalStatus = "approved"
- Clears rejectionReason
- Logs activity: "Product Approved"
```

#### Reject Product

```
PATCH /api/admin/products/:id/reject
Authorization: Bearer <token>
Middleware: requireRole('admin', 'manager', 'super_admin')

{
  "reason": "Price is too high for market"
}

Response (200):
{
  "success": true,
  "message": "Product rejected",
  "product": {
    "_id": "...",
    "approvalStatus": "rejected",
    "rejectionReason": "Price is too high for market",
    ...
  }
}

Effects:
- Sets approvalStatus = "rejected"
- Stores rejectionReason
- Logs activity: "Product Rejected"
- User can edit and resubmit
```

---

### 📊 Dashboard Routes

#### Dashboard Stats

```
GET /api/dashboard/stats
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "totalProducts": 45,
    "approvedProducts": 40,
    "pendingProducts": 3,
    "rejectedProducts": 2,
    "totalUsers": 12,
    "lowStockCount": 5,
    "restockQueueCount": 5
  }
}

Access Control:
- Users: See stats for own products only
- Managers/Admins: See all stats
```

---

## 🔐 Authentication

### JWT Implementation

```typescript
// Token Generation (on login)
const token = jwt.sign(
	{
		userId: user._id,
		role: user.role,
		isSuperAdmin: user.isSuperAdmin,
	},
	process.env.JWT_SECRET,
	{ expiresIn: process.env.JWT_EXPIRE || "7d" },
);

// Token Validation (middleware)
const requireAuth = async (req, res, next) => {
	try {
		const token = req.cookies.token;

		if (!token) {
			return res.status(401).json({
				success: false,
				message: "No token provided",
			});
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId);

		if (!user) {
			return res.status(401).json({
				success: false,
				message: "User not found",
			});
		}

		req.user = user;
		next();
	} catch (error) {
		res.status(401).json({
			success: false,
			message: "Invalid token",
		});
	}
};
```

### Cookie Configuration

```typescript
// HTTP-Only Cookie (secure)
res.cookie("token", token, {
	httpOnly: true, // Cannot be accessed by JavaScript
	secure: process.env.NODE_ENV === "production", // HTTPS only in production
	sameSite: "strict", // CSRF protection
	maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});
```

### Demo Accounts for Testing

```typescript
const DEMO_ACCOUNTS = [
	{
		email: "user@inventory.com",
		password: "user123",
		role: "user",
		name: "Regular User",
	},
	{
		email: "manager@inventory.com",
		password: "manager123",
		role: "manager",
		name: "Manager Account",
	},
	{
		email: "admin@inventory.com",
		password: "admin123",
		role: "admin",
		name: "Admin Account",
	},
	{
		email: "superadmin@inventory.com",
		password: "superadmin123",
		role: "super_admin",
		name: "Super Admin Account",
	},
];

// These are seeded in database on /api/seed
```

---

## 🛡️ RBAC Middleware

### requireAuth Middleware

```typescript
// Validates JWT token and attaches user to request
export const requireAuth = async (req, res, next) => {
	// Check token in cookies
	// Verify JWT signature
	// Fetch user from database
	// Attach to req.user
	// Call next()
};
```

### requireRole Middleware

```typescript
// Checks if user has required role
export const requireRole = (...allowedRoles) => {
	return async (req, res, next) => {
		if (!allowedRoles.includes(req.user?.role)) {
			return res.status(403).json({
				success: false,
				message: "Insufficient permissions",
			});
		}
		next();
	};
};
```

### requireOwnershipOrRole Middleware

```typescript
// Allows if user is owner OR has required role (e.g., admin)
export const requireOwnershipOrRole = (allowedRoles) => {
	return async (req, res, next) => {
		const { id: itemId } = req.params;
		const userId = req.user?._id;
		const userRole = req.user?.role;

		// Get item from database
		let createdBy;

		if (itemType === "Product") {
			const product = await Product.findById(itemId);
			createdBy = product.createdBy;
		} else if (itemType === "RestockQueue") {
			const restockItem =
				await RestockQueue.findById(itemId).populate("product");
			createdBy = restockItem.product.createdBy;
		}

		// Allow if:
		// 1. User has required role (admin/manager)
		// 2. User is the owner (createdBy)
		const hasRole = allowedRoles.includes(userRole);
		const isOwner = createdBy?.toString() === userId?.toString();

		if (!hasRole && !isOwner) {
			return res.status(403).json({
				success: false,
				message: "You can only manage items you created",
			});
		}

		next();
	};
};
```

### cannotTargetSuperAdmin Middleware

```typescript
// Prevents changes to super_admin users
export const cannotTargetSuperAdmin = async (req, res, next) => {
	const { id } = req.params;
	const targetUser = await User.findById(id);

	if (targetUser?.role === "super_admin") {
		return res.status(403).json({
			success: false,
			message: "Cannot modify super_admin users",
		});
	}

	next();
};
```

---

## 📁 Project Structure

```
src/
├── app.ts                           # Express app setup & routes
├── server.ts                        # Server entry point
│
├── models/                          # Mongoose schemas
│   ├── User.ts                     # User model with role enum
│   ├── Product.ts                  # Product model with approval workflow
│   ├── Category.ts                 # Category model
│   ├── RestockQueue.ts             # Restock queue with priority logic
│   ├── Order.ts                    # (Optional) Order model
│   └── ActivityLog.ts              # Activity audit trail
│
├── controllers/                     # Business logic
│   ├── authController.ts           # Login, logout, me endpoint
│   ├── productController.ts        # CRUD operations, stock management
│   ├── restockController.ts        # Restock queue operations
│   ├── categoryController.ts       # Category CRUD
│   ├── adminController.ts          # User mgmt, role assignment
│   ├── approvalController.ts       # Approve/reject products
│   ├── dashboardController.ts      # Analytics & stats
│   └── activityController.ts       # Activity logs
│
├── routes/                          # API endpoint definitions
│   ├── authRoutes.ts               # /api/auth
│   ├── productRoutes.ts            # /api/products
│   ├── restockRoutes.ts            # /api/restock
│   ├── categoryRoutes.ts           # /api/categories
│   ├── adminRoutes.ts              # /api/admin
│   ├── dashboardRoutes.ts          # /api/dashboard
│   └── activityRoutes.ts           # /api/activity
│
├── middleware/                      # Express middleware
│   ├── rbacMiddleware.ts           # Auth, roles, ownership checks
│   ├── errorHandler.ts             # Global error handling
│   ├── validation.ts               # Input validation
│   └── logger.ts                   # Request logging
│
├── utils/                           # Helper functions
│   ├── seedDatabase.ts             # Database initialization
│   ├── validators.ts               # Input validation logic
│   ├── stockUtils.ts               # Stock level calculations
│   ├── emailUtils.ts               # Email notifications (optional)
│   └── helpers.ts                  # General utilities
│
├── types/                           # TypeScript interfaces
│   ├── auth.ts                     # Auth-related types
│   ├── products.ts                 # Product types
│   ├── user.ts                     # User types
│   └── index.ts                    # Type exports
│
└── constants/
    ├── roles.ts                    # Role constants
    ├── messages.ts                 # Error/success messages
    └── config.ts                   # Configuration constants
```

---

## 🎯 Key Controllers & Logic

### AuthController

**Responsibilities:**

- User login with email/password
- Generate JWT token
- Return user data
- Logout and token cleanup

```typescript
export const login = async (req: Request, res: Response) => {
	// 1. Validate email & password provided
	// 2. Find user by email
	// 3. Compare passwords (bcrypt)
	// 4. Generate JWT token
	// 5. Set HTTP-only cookie
	// 6. Return token + user data
};
```

### ProductController

**Responsibilities:**

- List products (role-based filtering)
- Create product (submit for approval)
- Update product (reset approval if needed)
- Delete product (ownership check)
- Restock product (update stock)

```typescript
export const getAllProducts = async (req: Request, res: Response) => {
	// 1. Build filter based on user role
	//    - User: filter.createdBy = userId
	//    - Manager/Admin: no filter (see all)
	// 2. Apply search, category, status filters
	// 3. Paginate results
	// 4. Populate category & createdBy info
	// 5. Return with counts
};

export const createProduct = async (req: Request, res: Response) => {
	// 1. Validate input
	// 2. Create product with:
	//    - approvalStatus = "pending"
	//    - createdBy = req.user._id
	// 3. Log activity: "Product Created"
	// 4. Return product data
};

export const updateProduct = async (req: Request, res: Response) => {
	// 1. Check ownership via middleware
	// 2. Validate input
	// 3. If was approved, reset to pending
	// 4. Update fields
	// 5. Log activity: "Product Updated"
	// 6. Return updated product
};

export const restockProduct = async (req: Request, res: Response) => {
	// 1. Check ownership via middleware
	// 2. Validate quantity > 0
	// 3. Update product.stock += quantity
	// 4. Check if stock > threshold
	//    - If yes: Remove from RestockQueue
	//    - If no: Keep in queue
	// 5. Log activity: "Product Restocked"
	// 6. Return updated product
};
```

### RestockController

**Responsibilities:**

- Get restock queue (role-based filtering)
- Calculate priority based on stock levels
- Resolve restock items
- Remove from queue

```typescript
export const getRestockQueue = async (req: Request, res: Response) => {
	// 1. User role check
	//    - User: filter by product.createdBy = userId
	//    - Manager/Admin: no filter
	// 2. Apply priority filter if provided
	// 3. Calculate priority counts (All, High, Medium, Low)
	// 4. Return with pagination
};

// Priority Calculation:
// High: stock <= 30% of threshold
// Medium: stock <= 65% of threshold
// Low: stock > 65% of threshold
```

### AdminController

**Responsibilities:**

- User management
- Role assignment
- Category permission management
- Product approval/rejection

```typescript
export const updateCategoryPermissions = async (
	req: Request,
	res: Response,
) => {
	// 1. Validate target user is not super_admin
	// 2. Parse canCreate, canUpdate, canDelete from request
	// 3. Validate all are booleans
	// 4. Update user.categoryPermissions
	// 5. Log activity: "Permissions Updated"
	// 6. Return updated permissions
};
```

---

## ⚠️ Error Handling

### Global Error Handler

```typescript
// src/middleware/errorHandler.ts
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
	console.error("Unhandled error:", err);

	// Default error response
	const statusCode = err.status || 500;
	const message = err.message || "Internal server error";

	res.status(statusCode).json({
		success: false,
		message,
		...(process.env.NODE_ENV === "development" && { stack: err.stack }),
	});
});
```

### Error Response Format

```typescript
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

### Common Error Codes

| Code | Message      | Cause                         |
| ---- | ------------ | ----------------------------- |
| 400  | Bad Request  | Invalid input                 |
| 401  | Unauthorized | Missing/invalid token         |
| 403  | Forbidden    | Insufficient permissions      |
| 404  | Not Found    | Resource doesn't exist        |
| 409  | Conflict     | Duplicate entry (e.g., email) |
| 500  | Server Error | Unhandled exception           |

---

## 🛠️ Development Guide

### Running Locally

```bash
# Install dependencies
npm install

# Setup .env file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT_SECRET

# Seed database (optional)
npm run seed

# Start development server
npm run dev

# In another terminal, run frontend
cd ../../packages/frontend
npm run dev
```

### Development Scripts

```json
{
	"dev": "ts-node-dev --respawn src/server.ts",
	"build": "tsc",
	"start": "node dist/server.js",
	"seed": "ts-node src/utils/seedDatabase.ts",
	"lint": "eslint src/**/*.ts",
	"type-check": "tsc --noEmit"
}
```

### Code Style

- **TypeScript** - Strict mode enabled
- **ESLint** - Enforce best practices
- **Prettier** - Auto-format code

### Creating New Routes

```typescript
// 1. Create controller: src/controllers/exampleController.ts
export const getExample = async (req: Request, res: Response) => {
	try {
		const data = await ExampleModel.find();
		res.status(200).json({
			success: true,
			data,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error fetching data",
		});
	}
};

// 2. Create routes: src/routes/exampleRoutes.ts
import { Router } from "express";
import { getExample } from "../controllers/exampleController";
import { requireAuth } from "../middleware/rbacMiddleware";

const router = Router();
router.use(requireAuth);

router.get("/", getExample);

export default router;

// 3. Register in app.ts
app.use("/api/example", exampleRoutes);
```

### Testing with cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@inventory.com","password":"user123"}'

# Get products
curl http://localhost:5000/api/products \
  -H "Authorization: Bearer <token>"

# Create product
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Laptop",
    "price":1200,
    "stock":10,
    "minStockThreshold":5,
    "category":"category_id"
  }'
```

---

## 🚀 Deployment

### Environment Setup for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/smart-inventory
JWT_SECRET=your_production_secret_key_min_32_chars
JWT_EXPIRE=7d
CLIENT_URL=https://your-frontend-domain.com
```

### Deployment to Heroku

```bash
# 1. Create Heroku app
heroku create smart-inventory-api

# 2. Set environment variables
heroku config:set JWT_SECRET=your_secret_key
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set CLIENT_URL=https://your-frontend.com

# 3. Deploy
git push heroku main

# 4. View logs
heroku logs --tail
```

### Deployment to Railway/Render

1. Connect GitHub repository
2. Set environment variables in dashboard
3. Auto-deploys on push to main
4. View logs in deployment dashboard

### Production Checklist

- ✅ Set `NODE_ENV=production`
- ✅ Use strong JWT_SECRET (min 32 chars)
- ✅ Enable CORS for your frontend domain only
- ✅ Use MongoDB Atlas (not local)
- ✅ Enable HTTPS (secure: true in cookies)
- ✅ Setup error logging/monitoring
- ✅ Configure database backups
- ✅ Set up rate limiting
- ✅ Enable request logging

---

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Problem:** "Failed to connect to MongoDB"

**Solution:**

```bash
# Check MongoDB is running (local)
mongod

# OR verify MongoDB Atlas connection string
# Format: mongodb+srv://user:password@cluster.mongodb.net/database

# Test connection
mongosh "mongodb+srv://user:password@cluster.mongodb.net/database"
```

### JWT Token Issues

**Problem:** "Invalid token" or "Token expired"

**Solution:**

```typescript
// Check JWT_SECRET is set
console.log(process.env.JWT_SECRET); // Should not be undefined

// Verify token wasn't tampered
jwt.verify(token, process.env.JWT_SECRET);

// Token format should be: Bearer <token>
// Check header: Authorization: Bearer eyJhbGc...
```

### CORS Errors

**Problem:** "Access to XMLHttpRequest blocked by CORS policy"

**Solution:**

```typescript
// Check CLIENT_URL in .env
app.use(
	cors({
		origin: process.env.CLIENT_URL,
		credentials: true,
	}),
);

// Ensure frontend URL matches exactly
// http://localhost:3000 !== http://localhost:3001
```

### Authentication Not Working

**Problem:** Login works but subsequent requests fail

**Solution:**

```typescript
// Check cookie is being sent
// In browser DevTools → Application → Cookies
// Should see 'token' cookie with httpOnly flag

// Verify middleware order
app.use(cookieParser()); // Must come before routes
app.use(cors({ credentials: true })); // Must include credentials

// Check withCredentials in frontend
// axios.create({ withCredentials: true })
```

### Low Stock Detection Not Working

**Problem:** RestockQueue not being created automatically

**Solution:**

```typescript
// Check product.stock vs minStockThreshold
if (product.stock <= product.minStockThreshold) {
	// Should create RestockQueue
}

// Verify RestockQueue model is indexed on product
// and isResolved for faster queries
```

### Activity Logs Not Appearing

**Problem:** No activity logs in database

**Solution:**

```typescript
// Ensure logActivity is called after operations
await logActivity({
	action: "Product Created",
	entityType: "Product",
	entityId: product._id,
	userId: req.user._id,
	description: `Product '${product.name}' created`,
});

// Check ActivityLog model exists
// Verify database connection before logging
```

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT Documentation](https://jwt.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [REST API Best Practices](https://restfulapi.net/)

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Contributors

- **Backend Lead:** [Your Name]
- **Database Design:** [Team Member]
- **API Documentation:** [Team Member]

---

## 📞 Support

For issues or questions:

- 📧 Email: backend@inventory.com
- 🐛 GitHub Issues: [Report Issue](link)
- 💬 Slack: #backend-support

---

**Last Updated:** April 12, 2026  
**Version:** 1.0.0  
**Status:** Production Ready ✅
