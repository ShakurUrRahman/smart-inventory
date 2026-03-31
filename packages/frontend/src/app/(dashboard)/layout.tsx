import { DashboardLayout } from "@/components/layout/DashboardLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Dashboard | InventoryOS",
	description: "Dashboard",
};

export default function RootDashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <DashboardLayout pageTitle="Dashboard">{children}</DashboardLayout>;
}
