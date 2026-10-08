// dashboard\app\dashboard\layout.tsx

"use client";
import Sidebar from "@/components/dashboard/sidebar/Sidebar";
import Topbar from "@/components/dashboard/topbar/Topbar";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex h-dvh overflow-hidden bg-page-bg">
            <Sidebar />
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">{children}</main>
            </div>
        </div>
    );
}