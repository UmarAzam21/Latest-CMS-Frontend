"use client";

import { ReactNode } from "react";
import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import NoticeModel from "@/components/user-dashboard/NoticeModel";

export default function UserDashboardLayout({ children }: { children: ReactNode }) {
	const [isNoticeOpen, setIsNoticeOpen] = useState(true);

	return (
<<<<<<< HEAD
		<>
			<div className="fixed inset-0 flex h-dvh min-h-0 overflow-hidden bg-slate-50 bg-page-bg">
				<Sidebar variant="user" />
				<div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
					<div className="z-topbar shrink-0 bg-white">
						<Topbar variant="user" />
					</div>
					<main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-6 py-4">{children}</main>
=======
		<div className="fixed inset-0 flex h-dvh min-h-0 overflow-hidden bg-page-bg">
			<Sidebar variant="user" />
			<div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
				<div className="z-topbar shrink-0 bg-white">
					<Topbar variant="user" />
>>>>>>> 682655caa08e5ca2986cc751d5ca7f2b36342ca9
				</div>
			</div>
			<NoticeModel isOpen={isNoticeOpen} onClose={() => setIsNoticeOpen(false)} />
		</>
	);
}
