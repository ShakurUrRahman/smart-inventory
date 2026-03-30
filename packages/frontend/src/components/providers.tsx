"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export function Providers({ children }: { children: React.ReactNode }) {
	const { rehydrateUser, isHydrated } = useAuthStore();

	useEffect(() => {
		// Rehydrate user on app load
		if (!isHydrated) {
			rehydrateUser();
		}
	}, [isHydrated, rehydrateUser]);

	return <>{children}</>;
}
