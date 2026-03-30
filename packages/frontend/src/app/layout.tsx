import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
	title: "Smart Inventory",
	description: "Smart Inventory Management System",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>
				<Providers>{children}</Providers>
				<Toaster position="top-right" />
			</body>
		</html>
	);
}
