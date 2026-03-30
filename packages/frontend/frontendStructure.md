# Frontend - Smart Inventory

## 📁 Directory Structure

```
frontend/
├── app/                          # Next.js App Router (main pages)
│   ├── layout.tsx               # Root layout component
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles with Tailwind
│
├── src/
│   ├── lib/
│   │   └── api.ts               # Axios instance configured
│   │
│   ├── components/              # Reusable React components
│   │   └── index.ts
│   │
│   ├── hooks/                   # Custom React hooks
│   │   └── index.ts
│   │
│   ├── types/                   # TypeScript types & interfaces
│   │   └── index.ts
│   │
│   ├── store/                   # Zustand state management
│   │   └── index.ts
│   │
│   └── services/                # API service functions
│       └── index.ts
│
├── public/                      # Static assets
│
├── package.json                 # Dependencies
├── tsconfig.json               # TypeScript config
├── next.config.js              # Next.js config
├── tailwind.config.js          # Tailwind config
├── postcss.config.js           # PostCSS config
└── .env.local                  # Environment variables
```

## 📦 Installed Dependencies

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Axios
- React Hook Form
- Zod
- Zustand
- React Query
- React Hot Toast
- Framer Motion

## 🚀 Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

## 📝 How to Use Each Folder

### `app/` - Next.js Pages

- Main routing and page structure
- Uses App Router (Next.js 14)
- Add new pages here

### `src/components/` - React Components

- Reusable UI components
- Example: Button, Card, Modal, etc.

### `src/hooks/` - Custom Hooks

- Custom React hooks
- Example: useAuth, useForm, etc.

### `src/types/` - TypeScript Types

- Type definitions and interfaces
- Example: User, Product, etc.

### `src/store/` - Zustand Stores

- Global state management
- Example: authStore, inventoryStore

### `src/services/` - API Services

- Functions to call backend API
- Uses axios client from `lib/api.ts`

### `src/lib/api.ts` - API Client

- Pre-configured axios instance
- Base URL: `http://localhost:5000/api`
- Credentials enabled for auth

## 🔗 API Connection

All API calls should go through the configured axios client:

```typescript
import apiClient from "@/lib/api";

// Usage in services
const fetchUsers = async () => {
	const { data } = await apiClient.get("/users");
	return data;
};
```

## 🎨 Styling

- Tailwind CSS for styling
- Global styles in `app/globals.css`
- Use `className` for component styling

## 📚 Resources

- [Next.js 14 Documentation](https://nextjs.org)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Zustand](https://zustand-demo.vercel.app)
