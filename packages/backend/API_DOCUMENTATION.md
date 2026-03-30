# Inventory API Documentation

Base URL: `http://localhost:5000/api/inventory`

## Endpoints

### 1. Get All Inventory Items

**GET** `/inventory`

Get paginated list of inventory items with optional filtering.

**Query Parameters:**

- `page` (number, default: 1) - Page number for pagination
- `limit` (number, default: 10) - Items per page
- `category` (string, optional) - Filter by category
- `search` (string, optional) - Full-text search on name, SKU, description

**Response:**

```json
{
	"success": true,
	"data": [
		{
			"_id": "507f1f77bcf86cd799439011",
			"name": "Product Name",
			"description": "Product description",
			"sku": "SKU001",
			"quantity": 100,
			"reorderLevel": 20,
			"price": 29.99,
			"category": "Electronics",
			"supplier": "Supplier Name",
			"lastRestocked": "2024-01-15T10:00:00Z",
			"createdAt": "2024-01-15T10:00:00Z",
			"updatedAt": "2024-01-15T10:00:00Z"
		}
	],
	"pagination": {
		"total": 50,
		"page": 1,
		"limit": 10,
		"pages": 5
	}
}
```

**Example Request:**

```bash
curl "http://localhost:5000/api/inventory?page=1&limit=10&category=Electronics"
```

---

### 2. Get Item by ID

**GET** `/inventory/:id`

Get a single inventory item by its ID.

**Parameters:**

- `id` (string, required) - MongoDB ObjectId

**Response:**

```json
{
	"success": true,
	"data": {
		"_id": "507f1f77bcf86cd799439011",
		"name": "Product Name",
		"description": "Product description",
		"sku": "SKU001",
		"quantity": 100,
		"reorderLevel": 20,
		"price": 29.99,
		"category": "Electronics",
		"supplier": "Supplier Name",
		"lastRestocked": "2024-01-15T10:00:00Z",
		"createdAt": "2024-01-15T10:00:00Z",
		"updatedAt": "2024-01-15T10:00:00Z"
	}
}
```

**Example Request:**

```bash
curl http://localhost:5000/api/inventory/507f1f77bcf86cd799439011
```

---

### 3. Create Inventory Item

**POST** `/inventory`

Create a new inventory item.

**Request Body:**

```json
{
	"name": "Product Name",
	"description": "Optional product description",
	"sku": "SKU001",
	"quantity": 100,
	"reorderLevel": 20,
	"price": 29.99,
	"category": "Electronics",
	"supplier": "Supplier Name"
}
```

**Required Fields:** `name`, `sku`, `quantity`, `price`, `category`

**Response:** Returns the created item (201 Created)

**Example Request:**

```bash
curl -X POST http://localhost:5000/api/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "description": "High-performance laptop",
    "sku": "LAPTOP001",
    "quantity": 50,
    "reorderLevel": 10,
    "price": 999.99,
    "category": "Electronics",
    "supplier": "Tech Supplies Inc"
  }'
```

---

### 4. Update Inventory Item

**PUT** `/inventory/:id`

Update an existing inventory item.

**Parameters:**

- `id` (string, required) - MongoDB ObjectId

**Request Body:** (all fields optional)

```json
{
	"name": "Updated Product Name",
	"description": "Updated description",
	"sku": "SKU002",
	"quantity": 150,
	"reorderLevel": 25,
	"price": 39.99,
	"category": "Electronics",
	"supplier": "New Supplier"
}
```

**Response:** Returns the updated item

**Example Request:**

```bash
curl -X PUT http://localhost:5000/api/inventory/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 150,
    "price": 39.99
  }'
```

---

### 5. Delete Inventory Item

**DELETE** `/inventory/:id`

Delete an inventory item.

**Parameters:**

- `id` (string, required) - MongoDB ObjectId

**Response:**

```json
{
	"success": true,
	"message": "Inventory item deleted successfully",
	"data": {
		/* deleted item */
	}
}
```

**Example Request:**

```bash
curl -X DELETE http://localhost:5000/api/inventory/507f1f77bcf86cd799439011
```

---

### 6. Update Item Quantity

**PATCH** `/inventory/:id/quantity`

Add or subtract quantity from an item (for restocking/sales).

**Parameters:**

- `id` (string, required) - MongoDB ObjectId

**Request Body:**

```json
{
	"quantity": 20,
	"type": "add"
}
```

**Fields:**

- `quantity` (number, required) - Amount to add/subtract
- `type` (string, required) - Either "add" or "subtract"

**Response:** Returns the updated item

**Example Request:**

```bash
# Restock: add 50 units
curl -X PATCH http://localhost:5000/api/inventory/507f1f77bcf86cd799439011/quantity \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 50,
    "type": "add"
  }'

# Sale: remove 5 units
curl -X PATCH http://localhost:5000/api/inventory/507f1f77bcf86cd799439011/quantity \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 5,
    "type": "subtract"
  }'
```

---

### 7. Get Low Stock Items

**GET** `/inventory/low-stock`

Get all items where quantity ≤ reorderLevel.

**Response:**

```json
{
	"success": true,
	"data": [
		{
			"_id": "507f1f77bcf86cd799439011",
			"name": "Product Name",
			"sku": "SKU001",
			"quantity": 5,
			"reorderLevel": 20,
			"price": 29.99,
			"category": "Electronics",
			"createdAt": "2024-01-15T10:00:00Z",
			"updatedAt": "2024-01-15T10:00:00Z"
		}
	],
	"count": 3
}
```

**Example Request:**

```bash
curl http://localhost:5000/api/inventory/low-stock
```

---

### 8. Get Inventory Statistics

**GET** `/inventory/statistics`

Get overall inventory statistics and metrics.

**Response:**

```json
{
	"success": true,
	"data": {
		"totalItems": 150,
		"totalValue": 45320.5,
		"lowStockCount": 8,
		"categories": ["Electronics", "Hardware", "Software"]
	}
}
```

**Example Request:**

```bash
curl http://localhost:5000/api/inventory/statistics
```

---

## Error Responses

All endpoints return error responses in this format:

```json
{
	"success": false,
	"message": "Error message describing what went wrong",
	"error": "Detailed error information (development only)"
}
```

**Common HTTP Status Codes:**

- `200` - Success (GET, PUT, PATCH, DELETE)
- `201` - Created (POST)
- `400` - Bad Request (validation error)
- `404` - Not Found (item doesn't exist)
- `500` - Server Error

---

## Usage Examples

### Complete CRUD Workflow

```bash
# 1. Create a new item
ITEM_ID=$(curl -X POST http://localhost:5000/api/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Keyboard",
    "sku": "KB001",
    "quantity": 50,
    "reorderLevel": 10,
    "price": 79.99,
    "category": "Electronics"
  }' | jq -r '.data._id')

# 2. Get the item
curl http://localhost:5000/api/inventory/$ITEM_ID

# 3. Update the item
curl -X PUT http://localhost:5000/api/inventory/$ITEM_ID \
  -H "Content-Type: application/json" \
  -d '{"price": 69.99}'

# 4. Restock the item
curl -X PATCH http://localhost:5000/api/inventory/$ITEM_ID/quantity \
  -H "Content-Type: application/json" \
  -d '{"quantity": 25, "type": "add"}'

# 5. Check low stock items
curl http://localhost:5000/api/inventory/low-stock

# 6. Delete the item
curl -X DELETE http://localhost:5000/api/inventory/$ITEM_ID
```

---

## Frontend Integration

The frontend provides TypeScript-typed service functions and React Query hooks for easy integration:

```typescript
import {
	useInventoryItems,
	useCreateInventoryItem,
} from "@/hooks/useInventory";

// Fetch items
const { data, isLoading } = useInventoryItems({ page: 1, limit: 10 });

// Create item
const { mutate } = useCreateInventoryItem({
	onSuccess: () => {
		toast.success("Item created!");
	},
});

mutate({
	name: "Product",
	sku: "SKU001",
	quantity: 50,
	reorderLevel: 10,
	price: 29.99,
	category: "Electronics",
});
```
