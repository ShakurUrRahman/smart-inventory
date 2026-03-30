"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import apiClient from "@/lib/api";

export default function DashboardPage() {
	const router = useRouter();
	const { user, clearUser } = useAuthStore();

	const handleLogout = async () => {
		try {
			await apiClient.post("/auth/logout");
			clearUser();
			toast.success("Logged out successfully!");
			router.push("/login");
		} catch (error) {
			toast.error("Logout failed");
		}
	};

	return (
		<div className="min-h-screen bg-[#0F1117] text-white p-8">
			<div className="max-w-6xl mx-auto">
				<div className="flex justify-between items-center mb-12">
					<h1 className="text-4xl font-bold">
						InventoryOS Dashboard
					</h1>
					<Button
						onClick={handleLogout}
						variant="outline"
						className="text-white border-white hover:bg-white hover:text-black"
					>
						Logout
					</Button>
				</div>

				<div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
					<h2 className="text-2xl font-semibold mb-4">
						Welcome, {user?.name}!
					</h2>
					<p className="text-slate-400 mb-6">
						You are successfully authenticated. This is a
						placeholder dashboard.
					</p>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="bg-slate-700 rounded-lg p-6">
							<div className="text-indigo-400 text-3xl mb-2">
								📦
							</div>
							<h3 className="font-semibold mb-2">Products</h3>
							<p className="text-slate-400 text-sm">
								Manage your inventory
							</p>
						</div>

						<div className="bg-slate-700 rounded-lg p-6">
							<div className="text-indigo-400 text-3xl mb-2">
								📋
							</div>
							<h3 className="font-semibold mb-2">Orders</h3>
							<p className="text-slate-400 text-sm">
								Track your orders
							</p>
						</div>

						<div className="bg-slate-700 rounded-lg p-6">
							<div className="text-indigo-400 text-3xl mb-2">
								📊
							</div>
							<h3 className="font-semibold mb-2">Analytics</h3>
							<p className="text-slate-400 text-sm">
								View reports & insights
							</p>
						</div>
					</div>

					<div className="mt-8 pt-8 border-t border-slate-700">
						<h3 className="font-semibold mb-4">Your Profile</h3>
						<div className="space-y-2 text-slate-400">
							<p>
								<span className="text-white">Name:</span>{" "}
								{user?.name}
							</p>
							<p>
								<span className="text-white">Email:</span>{" "}
								{user?.email}
							</p>
							<p>
								<span className="text-white">Role:</span>{" "}
								<span className="capitalize text-indigo-400">
									{user?.role}
								</span>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
