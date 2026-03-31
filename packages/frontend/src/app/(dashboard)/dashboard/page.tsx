"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { SkeletonGrid } from "@/components/shared/Skeleton";
import { Package, ShoppingCart, BarChart3, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface StatCard {
	title: string;
	value: string;
	change: string;
	icon: React.ReactNode;
	color: string;
}

export default function DashboardPage() {
	const router = useRouter();
	const { user } = useAuthStore();
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Simulate data loading
		const timer = setTimeout(() => setIsLoading(false), 1000);
		return () => clearTimeout(timer);
	}, []);

	const stats: StatCard[] = [
		{
			title: "Total Products",
			value: "1,234",
			change: "+12.5%",
			icon: <Package className="w-6 h-6" />,
			color: "indigo",
		},
		{
			title: "Active Orders",
			value: "89",
			change: "+2.3%",
			icon: <ShoppingCart className="w-6 h-6" />,
			color: "blue",
		},
		{
			title: "Revenue",
			value: "$45,231",
			change: "+8.1%",
			icon: <BarChart3 className="w-6 h-6" />,
			color: "green",
		},
		{
			title: "Growth Rate",
			value: "24.5%",
			change: "+4.3%",
			icon: <TrendingUp className="w-6 h-6" />,
			color: "purple",
		},
	];

	const colorMap: Record<string, string> = {
		indigo: "bg-indigo-500/20 text-indigo-400",
		blue: "bg-blue-500/20 text-blue-400",
		green: "bg-green-500/20 text-green-400",
		purple: "bg-purple-500/20 text-purple-400",
	};

	return (
		<>
			<PageHeader
				title="Dashboard"
				subtitle="Welcome back! Here's what's happening today."
			/>

			{/* Quick Stats */}
			{isLoading ? (
				<SkeletonGrid count={4} variant="stat" />
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					{stats.map((stat, index) => (
						<div
							key={index}
							className="bg-[#13161F] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors"
						>
							<div className="flex items-start justify-between mb-4">
								<div
									className={`p-3 rounded-lg ${colorMap[stat.color]}`}
								>
									{stat.icon}
								</div>
							</div>
							<h3 className="text-zinc-400 text-sm font-medium mb-2">
								{stat.title}
							</h3>
							<p className="text-2xl font-bold text-white mb-1">
								{stat.value}
							</p>
							<p className="text-green-400 text-xs font-medium">
								{stat.change} from last month
							</p>
						</div>
					))}
				</div>
			)}

			{/* Welcome Message */}
			<div className="bg-[#13161F] border border-indigo-500/20 rounded-xl p-8">
				<h2 className="text-xl font-semibold text-white mb-2">
					Welcome, {user?.name}! 👋
				</h2>
				<p className="text-zinc-400 mb-4">
					You&apos;re successfully logged in. The dashboard is ready
					to display your inventory data, orders, and analytics.
				</p>
				<p className="text-zinc-500 text-sm">
					Use the sidebar to navigate to different sections: Products,
					Categories, Orders, Restock Queue, and Activity Log.
				</p>
			</div>
		</>
	);
}
