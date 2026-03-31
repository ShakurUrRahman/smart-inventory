"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function ProductsPage() {
	return (
		<>
			<PageHeader
				title="Products"
				subtitle="Manage your product inventory"
				action={
					<Button className="bg-indigo-600 hover:bg-indigo-500 gap-2">
						<Plus className="w-4 h-4" />
						Add Product
					</Button>
				}
			/>

			<div className="bg-[#13161F] border border-white/10 rounded-xl p-8 text-center">
				<h3 className="text-lg font-semibold text-white mb-2">
					Products
				</h3>
				<p className="text-zinc-400">
					Product management features coming soon. Browse, create, and
					manage your products here.
				</p>
			</div>
		</>
	);
}
