import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "InventoryOS – Authentication",
	description: "Sign in to manage your inventory",
};

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen bg-[#0F1117] flex items-center justify-center p-4">
			{children}
		</div>
	);
}
