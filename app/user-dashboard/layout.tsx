"use client";

import { ReactNode } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";

export default function UserDashboardLayout({ children }: { children: ReactNode }) {
	return (
		<div className="flex h-screen bg-slate-50">
			<Sidebar variant="user" />
			<div className="flex flex-1 flex-col overflow-hidden">
				<Topbar variant="user" />
				<main className="flex-1 overflow-y-auto px-6 py-4">{children}</main>
			</div>
		</div>
	);
}
