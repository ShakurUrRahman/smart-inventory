# 🚀 Postman Quick Start - Import Collection

## 📥 Step 1: Download Postman

- Visit [postman.com/downloads](https://www.postman.com/downloads/)
- Download for your OS (Windows, Mac, Linux)
- Install and open

---

## ⚡ Step 2: Import the Collection (Easiest Way)

### Option A: Direct Import from File

1. **Download** the file: `smart-inventory-api.postman_collection.json`
2. Open Postman
3. Click **"Import"** (top left)
4. Click **"Upload Files"**
5. Select `smart-inventory-api.postman_collection.json`
6. Click **"Import"**
7. ✅ Collection is ready to use!

### Option B: Import from URL

If you uploaded the JSON to a URL:

1. Click **"Import"** in Postman
2. Click **"Link"** tab
3. Paste URL
4. Click **"Import"**

---

## 🔧 Step 3: Set Up Environment

### Create Environment Variables

1. Click **"Environments"** (left sidebar)
2. Click **"+"** to create new
3. Name: `Smart Inventory Dev`
4. Add these variables:

| Variable      | Value                       |
| ------------- | --------------------------- |
| `base_url`    | `http://localhost:5000/api` |
| `auth_token`  | (leave empty)               |
| `user_id`     | (leave empty)               |
| `category_id` | (leave empty)               |
| `product_id`  | (leave empty)               |
| `order_id`    | (leave empty)               |

5. Click **"Save"**

### Select Environment

- Top right dropdown → Select **"Smart Inventory Dev"**

---

## ✅ Step 4: Test Health Check

This endpoint requires NO setup (no auth needed):

1. Open the imported collection
2. Click **"Health Check"** folder
3. Click **"Get Health Status"**
4. Click **"Send"**
5. You should see:
    ```json
    {
    	"status": "ok",
    	"timestamp": "2024-03-30T12:00:00.000Z"
    }
    ```

✅ **If this works, your backend is running!**

---

## 🔐 Step 5: Complete Test Workflow

Follow this order to test everything:

### 1. Register User

- Click **Authentication** → **Register User**
- Modify email if needed: `john+2@example.com` (to avoid duplicate)
- Click **"Send"**
- Token is **auto-saved** to `auth_token` variable ✨

### 2. Create Category

- Click **Categories** → **Create Category**
- Click **"Send"**
- Category ID is **auto-saved** to `category_id` variable ✨

### 3. Create Product

- Click **Products** → **Create Product**
- Click **"Send"**
- Product ID is **auto-saved** to `product_id` variable ✨

### 4. Create Order

- Click **Orders** → **Create Order**
- Click **"Send"**
- Order number auto-generated! Example: `ORD-1001`

### 5. Get Data

- Click **Products** → **Get All Products**
- Click **Orders** → **Get All Orders**
- etc.

---

## 💡 The Auto-Save Magic ✨

When you send a request, the **Tests** tab automatically saves important IDs to environment variables.

Look at what's being saved:

```javascript
// After Register User
pm.environment.set("auth_token", jsonData.token);

// After Create Category
pm.environment.set("category_id", jsonData.data._id);

// After Create Product
pm.environment.set("product_id", jsonData.data._id);

// After Create Order
pm.environment.set("order_id", jsonData.data._id);
```

This means you don't have to manually copy-paste IDs! 🎉

---

## 🧪 All Available Endpoints

### 1. Health Check (No Auth)

```
GET /health
```

### 2. Authentication

```
POST /auth/register
POST /auth/login
```

### 3. Categories (CRUD)

```
POST /categories               (Create)
GET /categories                (Get All)
GET /categories/:id            (Get One)
PUT /categories/:id            (Update)
DELETE /categories/:id         (Delete)
```

### 4. Products (CRUD)

```
POST /products                 (Create)
GET /products                  (Get All)
GET /products/:id              (Get One)
PUT /products/:id              (Update)
DELETE /products/:id           (Delete)
```

### 5. Orders (CRUD)

```
POST /orders                   (Create, auto-generates ORD-XXXX)
GET /orders                    (Get All)
GET /orders/:id                (Get One)
PUT /orders/:id                (Update Status)
PUT /orders/:id                (Cancel)
```

### 6. Restock Queue

```
GET /restock-queue?resolved=false   (Get Pending)
PUT /restock-queue/:id              (Mark Resolved)
```

### 7. Activity Logs

```
GET /activities                      (Get Recent)
GET /activities/product/:productId   (Get for Product)
```

---

## 🔑 Using Variables in Requests

Variables are automatically inserted where you see `{{variable_name}}`

Example in **Create Product**:

```json
{
	"category": "{{category_id}}"
}
```

This automatically becomes:

```json
{
	"category": "507f1f77bcf86cd799439012"
}
```

---

## 🐛 Troubleshooting

### Issue: "Cannot GET /api/health"

**Solution:** Backend is not running

- Make sure to run `npm run dev` in `packages/backend`

### Issue: "Invalid token" or "Unauthorized"

**Solution:** Token variable is empty

- Run **Register User** or **Login** first
- Token will be auto-saved

### Issue: Variables show `{{variable}}`

**Solution:** Wrong environment selected

- Top right dropdown → Select **"Smart Inventory Dev"**

### Issue: "Duplicate email"

**Solution:** Email already registered

- Change email in Register User: `john+2@example.com`

### Issue: "Category not found"

**Solution:** Need to create category first

- Follow the order: Register → Create Category → Create Product

---

## 📊 Expected Response Formats

### Success Response

```json
{
	"success": true,
	"data": {
		/* object details */
	},
	"message": "Operation successful"
}
```

### Error Response

```json
{
	"success": false,
	"message": "Error description"
}
```

### List Response

```json
{
	"success": true,
	"data": [
		/* array of objects */
	],
	"total": 10
}
```

---

## 📝 Postman Console (for Debugging)

Press `Ctrl + Alt + C` to open console and see:

- Request details
- Response details
- Console.log() messages
- Variable values

---

## 🎯 Tips for Success

1. ✅ Follow the order: Health → Register → Category → Product → Order
2. ✅ Check that each request returns `"success": true`
3. ✅ Variables auto-save, so don't manually copy IDs
4. ✅ Check backend terminal for detailed error logs
5. ✅ Use Postman Console if something goes wrong
6. ✅ Try different test data if you get duplicates

---

## 🚀 Next Steps

Once you verify all endpoints work:

1. ✅ Backend API is working
2. Create controllers in `src/controllers/`
3. Create routes in `src/routes/`
4. Build frontend components
5. Connect frontend to backend API

---

## 📚 Files Provided

- ✅ `smart-inventory-api.postman_collection.json` - Import this!
- ✅ `POSTMAN_TESTING_GUIDE.md` - Detailed guide
- ✅ Backend running on http://localhost:5000

**Happy Testing! 🎉**
