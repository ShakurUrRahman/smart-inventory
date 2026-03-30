import { create } from "zustand";

export interface UserType {
	id: string;
	name: string;
	email: string;
	role: "admin" | "manager" | "viewer" | string;
	createdAt?: string;
}

interface AuthState {
	user: UserType | null;
	isLoading: boolean;
	setUser: (user: UserType) => void;
	clearUser: () => void;
	setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	isLoading: false,
	setUser: (user) => set({ user }),
	clearUser: () => set({ user: null }),
	setLoading: (loading) => set({ isLoading: loading }),
}));
