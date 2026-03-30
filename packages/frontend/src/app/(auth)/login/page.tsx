"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import apiClient from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

// Zod schema
const loginSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
	const router = useRouter();
	const { setUser } = useAuthStore();
	const [isLoading, setIsLoading] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
	});

	const onSubmit = async (data: LoginFormData) => {
		setIsLoading(true);
		try {
			const response = await apiClient.post("/auth/login", {
				email: data.email,
				password: data.password,
			});

			if (response.data.success) {
				setUser(response.data.user);
				toast.success("Signed in successfully!");
				router.push("/dashboard");
			}
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Login failed");
		} finally {
			setIsLoading(false);
		}
	};

	const handleDemoLogin = async () => {
		setValue("email", "demo@inventory.com");
		setValue("password", "demo123");

		// Small delay to let form update, then submit
		setTimeout(() => {
			handleSubmit(onSubmit)();
		}, 0);
	};

	return (
		<div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
			{/* LEFT PANEL - Hidden on mobile */}
			<motion.div
				initial={{ opacity: 0, x: -20 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.5 }}
				className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 rounded-2xl p-12 text-white"
			>
				<div className="text-6xl mb-6">📦</div>
				<h1 className="text-4xl font-bold mb-4 text-center">
					InventoryOS
				</h1>
				<p className="text-xl text-indigo-100 text-center">
					Smart stock. Smarter decisions.
				</p>
			</motion.div>

			{/* RIGHT PANEL - Login Form */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4, delay: 0.1 }}
				className="flex justify-center items-center"
			>
				<Card className="w-full max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 p-8 shadow-2xl">
					<div className="mb-8">
						<h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
							Welcome back
						</h2>
						<p className="text-slate-600 dark:text-slate-400">
							Sign in to your account
						</p>
					</div>

					<form
						onSubmit={handleSubmit(onSubmit)}
						className="space-y-6"
					>
						{/* Email Field */}
						<div className="space-y-2">
							<Label
								htmlFor="email"
								className="text-slate-700 dark:text-slate-300"
							>
								Email
							</Label>
							<Input
								id="email"
								type="email"
								placeholder="you@example.com"
								className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400"
								{...register("email")}
								disabled={isLoading}
							/>
							{errors.email && (
								<p className="text-red-500 text-sm mt-1">
									{errors.email.message}
								</p>
							)}
						</div>

						{/* Password Field */}
						<div className="space-y-2">
							<Label
								htmlFor="password"
								className="text-slate-700 dark:text-slate-300"
							>
								Password
							</Label>
							<Input
								id="password"
								type="password"
								placeholder="••••••••"
								className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400"
								{...register("password")}
								disabled={isLoading}
							/>
							{errors.password && (
								<p className="text-red-500 text-sm mt-1">
									{errors.password.message}
								</p>
							)}
						</div>

						{/* Sign In Button */}
						<Button
							type="submit"
							className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 rounded-lg transition-colors"
							disabled={isLoading}
						>
							{isLoading ? (
								<div className="flex items-center gap-2">
									<div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
									Signing in...
								</div>
							) : (
								"Sign In"
							)}
						</Button>
					</form>

					{/* Demo Login Button */}
					<Button
						type="button"
						variant="outline"
						className="w-full mt-4 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
						onClick={handleDemoLogin}
						disabled={isLoading}
					>
						Demo Login
					</Button>

					{/* Register Link */}
					<p className="text-center text-slate-600 dark:text-slate-400 mt-6">
						Don&apos;t have an account?{" "}
						<Link
							href="/register"
							className="text-indigo-500 hover:text-indigo-600 font-semibold"
						>
							Register
						</Link>
					</p>
				</Card>
			</motion.div>
		</div>
	);
}
