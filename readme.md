# Smart Inventory

A modern, full-stack inventory management system built with Express.js and Next.js 14.

## Project Structure

```
smart-inventory/
├── packages/
│   ├── backend/          # Express.js API server
│   └── frontend/         # Next.js 14 web application
├── package.json          # Monorepo root configuration
└── README.md
```

## Tech Stack

### Backend

- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcryptjs
- **Validation**: Built-in Express middleware

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod validation
- **Data Fetching**: Axios + React Query
- **Notifications**: React Hot Toast
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- MongoDB (local or Atlas URI)

### Installation

1. **Clone or extract the project**

    ```bash
    cd smart-inventory
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

    This will install dependencies for both backend and frontend using npm workspaces.

3. **Configure environment variables**

    **Backend** (`packages/backend/.env`):

    ```
    MONGODB_URI=mongodb://localhost:27017/smart-inventory
    JWT_SECRET=your-super-secret-jwt-key-change-in-production
    JWT_EXPIRES_IN=7d
    PORT=5000
    NODE_ENV=development
    CLIENT_URL=http://localhost:3000
    ```

    **Frontend** (`packages/frontend/.env.local`):

    ```
    NEXT_PUBLIC_API_URL=http://localhost:5000/api
    ```

### Running the Project

**Development mode** (runs both backend and frontend):

```bash
npm run dev
```

Or run individually:

**Backend** (from `packages/backend`):

```bash
npm run dev
```

Runs on `http://localhost:5000`

**Frontend** (from `packages/frontend`):

```bash
npm run dev
```

Runs on `http://localhost:3000`

### Building for Production

```bash
npm run build
```

### API Health Check

Test the backend is running:

```bash
curl http://localhost:5000/api/health
```

Expected response:

```json
{
	"status": "ok",
	"timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Project Features

### Backend Structure

- `src/models/` - Mongoose schemas
- `src/routes/` - Route handlers
- `src/controllers/` - Business logic
- `src/middleware/` - Custom middleware
- `src/utils/` - Utility functions
- `src/app.ts` - Main Express app with CORS, cookie-parser, and health check

### Frontend Structure

- `src/app/` - Next.js App Router pages and layouts
- `src/components/` - Reusable React components
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utility functions and API client
- `src/types/` - TypeScript type definitions
- `src/store/` - Zustand state management
- `src/services/` - API service functions

## API Configuration

The frontend axios instance is pre-configured with:

- Base URL pointing to `http://localhost:5000/api`
- Credentials enabled for cross-origin requests
- Automatic JSON serialization

Located at: `packages/frontend/src/lib/api.ts`

## Development Guidelines

- Use TypeScript for type safety
- Follow existing folder structure conventions
- Create reusable components in `components/`
- Keep API calls in `services/` directory
- Use React Hook Form for forms with Zod validation
- Manage global state with Zustand stores
- Use React Query for server state management

## Next Steps

1. Connect to MongoDB
2. Create models and schemas
3. Implement authentication routes
4. Build API endpoints
5. Create frontend pages and components
6. Integrate React Query hooks
7. Add form validation with Zod
8. Deploy to production

## License

MIT
