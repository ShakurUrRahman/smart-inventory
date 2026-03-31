"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function RestockPage() {
	return (
		<>
			<PageHeader
				title="Restock Queue"
				subtitle="Monitor products that need restocking"
			/>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				<div className="bg-[#13161F] border border-red-500/20 rounded-xl p-6">
					<div className="flex items-center gap-3 mb-2">
						<AlertTriangle className="w-5 h-5 text-red-400" />
						<span className="text-sm font-medium text-zinc-400">
							High Priority
						</span>
					</div>
					<p className="text-2xl font-bold text-white">3</p>
				</div>

				<div className="bg-[#13161F] border border-amber-500/20 rounded-xl p-6">
					<div className="flex items-center gap-3 mb-2">
						<AlertTriangle className="w-5 h-5 text-amber-400" />
						<span className="text-sm font-medium text-zinc-400">
							Medium Priority
						</span>
					</div>
					<p className="text-2xl font-bold text-white">5</p>
				</div>

				<div className="bg-[#13161F] border border-blue-500/20 rounded-xl p-6">
					<div className="flex items-center gap-3 mb-2">
						<AlertTriangle className="w-5 h-5 text-blue-400" />
						<span className="text-sm font-medium text-zinc-400">
							Low Priority
						</span>
					</div>
					<p className="text-2xl font-bold text-white">8</p>
				</div>
			</div>

			<div className="bg-[#13161F] border border-white/10 rounded-xl p-8 text-center">
				<h3 className="text-lg font-semibold text-white mb-2">
					Restock Queue
				</h3>
				<p className="text-zinc-400">
					View and manage products that need restocking. Track
					priority levels and automation.
				</p>
			</div>
		</>
	);
}
