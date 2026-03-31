"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Activity, Clock, User } from "lucide-react";

export default function ActivityPage() {
	const recentActivities = [
		{
			action: "Product Created",
			user: "Demo User",
			time: "2 minutes ago",
			type: "create",
		},
		{
			action: "Order Updated",
			user: "Demo User",
			time: "1 hour ago",
			type: "update",
		},
		{
			action: "Stock Adjusted",
			user: "Demo User",
			time: "3 hours ago",
			type: "update",
		},
	];

	return (
		<>
			<PageHeader
				title="Activity Log"
				subtitle="Track all system activities and changes"
			/>

			<div className="bg-[#13161F] border border-white/10 rounded-xl overflow-hidden">
				<div className="divide-y divide-white/10">
					{recentActivities.map((activity, index) => (
						<div
							key={index}
							className="p-6 hover:bg-white/5 transition-colors"
						>
							<div className="flex items-center gap-4">
								<div className="p-3 rounded-lg bg-indigo-500/20">
									<Activity className="w-5 h-5 text-indigo-400" />
								</div>
								<div className="flex-1">
									<h4 className="text-white font-medium">
										{activity.action}
									</h4>
									<div className="flex items-center gap-4 mt-1">
										<div className="flex items-center gap-1 text-xs text-zinc-400">
											<User className="w-3 h-3" />
											{activity.user}
										</div>
										<div className="flex items-center gap-1 text-xs text-zinc-500">
											<Clock className="w-3 h-3" />
											{activity.time}
										</div>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			<div className="mt-6 text-center text-zinc-400 text-sm">
				<p>More activities coming soon as you use the system</p>
			</div>
		</>
	);
}
