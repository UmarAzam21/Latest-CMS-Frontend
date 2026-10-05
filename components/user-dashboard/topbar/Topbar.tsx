// dashboard\components\user-dashboard\topbar\Topbar.tsx

"use client";

import { useEffect, useState } from "react";
import {
    ChevronDown, FileCheck2, Calculator, Building2, ReceiptText, Landmark, BriefcaseBusiness, User, LogOut, Search, Menu,
} from "lucide-react";

import Dropdown from "@/components/ui/Dropdown";
import DropdownItem from "@/components/ui/DropdownItem";
import {
    getAdminAuthHeaders,
    setStoredAdminToken,
    setStoredAdminUser,
} from "@/lib/auth";
import Image from "next/image";
import { ASSETS } from "@/lib/assets";
import NotificationModal from "../../ui/NotificationModal";
import CalculatorButton from "@/components/user-dashboard/expenseManager/Calculator";
import { useSidebar } from "@/components/dashboard/sidebar/SidebarContext";

type AdminProfile = {
    name?: string;
    username?: string;
    email?: string;
    role?: string;
    profile_image?: string;
};

type TopbarProps = {
    variant?: "admin" | "user";
};

export default function Topbar({ variant = "admin" }: TopbarProps) {
    const isUser = variant === "user";
    const { toggleMobile } = useSidebar();

    const [admin, setAdmin] = useState<AdminProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const displayName = isUser
        ? admin?.username || "User"
        : admin?.name || admin?.email || "Umar";

    const role = admin?.role || (isUser ? "User" : "Super Admin");

    useEffect(() => {
        let mounted = true;

        async function loadAdmin() {
            try {
                setLoading(true);

                const res = await fetch(
                    isUser ? "/auth/me" : "/api/admin/me",
                    {
                        method: "GET",
                        credentials: "include",
                        cache: "no-store",
                        headers: {
                            Accept: "application/json",
                            ...getAdminAuthHeaders(),
                        },
                    }
                );

                if (!res.ok) {
                    if (mounted) {
                        setAdmin(null);
                    }

                    return;
                }

                const data = await res.json();

                if (data && mounted) {
                    setAdmin({
                        name: data.name || "",
                        username: data.username || "",
                        email: data.email || "",
                        role:
                            data.role ||
                            data.user_role ||
                            (isUser ? "User" : "Admin"),
                        profile_image: data.profile_image || undefined,
                    });
                }
            } catch (error) {
                console.error("Failed to load admin profile:", error);

                if (mounted) {
                    setAdmin(null);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        loadAdmin();

        return () => {
            mounted = false;
        };
    }, [isUser]);

    async function handleLogout() {
        try {
            const res = await fetch("/api/admin/logout", {
                method: "POST",
                credentials: "include",
                cache: "no-store",
                headers: {
                    Accept: "application/json",
                    ...getAdminAuthHeaders(),
                },
            });

            if (res.ok) {
                setStoredAdminToken(null);
                setStoredAdminUser(null);

                window.location.href = "/login";
            } else {
                const errorText = await res.text();
                console.error("Logout failed:", errorText);
                alert("Logout failed. Please try again.");
            }
        } catch (error) {
            console.error("Logout error:", error);
            alert("An error occurred during logout. Please try again.");
        }
    }

    const navItemClass =
        "flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 para-tiny font-medium text-text-secondary default-transition hover:text-primary hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

    const ctaItemClass =
        "flex h-[27px] items-center gap-1 whitespace-nowrap rounded-full border border-primary bg-primary px-1.5 py-0 para-tiny font-medium text-white default-transition hover:border-primary-light hover:bg-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

    return (
        <header className="flex h-13 items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-2 sm:gap-4 sm:px-brand">

            {/* LEFT SIDE: hamburger + search + nav */}
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">

                {/* HAMBURGER — mobile only, toggles the shared sidebar context */}
                <button
                    type="button"
                    onClick={toggleMobile}
                    aria-label="Toggle sidebar"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden"
                >
                    <Menu size={18} strokeWidth={1.8} />
                </button>

                {/* SEARCH — full pill on sm+, icon-only toggle on mobile */}
                <div className="relative hidden w-full max-w-xs shrink-0 sm:block">
                    <Search
                        size={16}
                        strokeWidth={1.8}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                        type="text"
                        placeholder={isUser ? "Search your workspace..." : "Search pages, messages, media..."}
                        className="h-[35px] w-[300px] rounded-full border border-slate-200 bg-[#F9FAFB] py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                    />
                </div>
                <button
                    type="button"
                    aria-label="Search"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 sm:hidden"
                >
                    <Search size={16} strokeWidth={1.8} />
                </button>

                {/* NAVIGATION — horizontally scrollable on mobile instead of hidden, so every item stays reachable */}
                <nav
                    className="flex h-[35px] min-w-0 items-center gap-1 overflow-x-auto rounded-full border border-slate-200 bg-[#F9FAFB] px-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    aria-label="Dashboard navigation"
                >
                    <a href="#" className={navItemClass}>
                        Tax Rates
                    </a>

                    <a href="#" className={navItemClass}>
                        Tax Calculator
                    </a>

                    <Dropdown
                        align="left"
                        trigger={
                            <button type="button" className={navItemClass}>
                                Services
                                <ChevronDown size={14} strokeWidth={2} />
                            </button>
                        }
                    >
                        <DropdownItem label="Filer Status" icon={FileCheck2} href="/services/filer-status" />
                        <DropdownItem label="Tax Calculator" icon={Calculator} href="/services/tax-calculator" />
                        <DropdownItem label="Tax Return Filing" icon={ReceiptText} href="/services/tax-return" />
                        <DropdownItem label="Income Tax" icon={Landmark} href="/services/income-tax" />
                        <DropdownItem label="Sales Tax" icon={ReceiptText} href="/services/sales-tax" />
                        <DropdownItem label="Business Registration" icon={Building2} href="/services/business-registration" />
                        <DropdownItem label="Tax Consultancy" icon={BriefcaseBusiness} href="/services/tax-consultancy" />
                    </Dropdown>

                    <a href="#" className={navItemClass}>
                        Support
                    </a>

                    <CalculatorButton label="Calculator" className={ctaItemClass} />
                </nav>
            </div>

            {/* RIGHT SIDE: notifications + account */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">

                <NotificationModal userId={admin?.email} />

                <Dropdown
                    trigger={
                        <div className="flex cursor-pointer items-center gap-2 rounded-lg py-1 pl-1 pr-1 default-transition hover:bg-slate-50 sm:gap-3 sm:pr-2">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-danger-bg text-sm font-semibold text-primary">
                                {admin?.profile_image ? (
                                    <Image
                                        src={admin.profile_image}
                                        alt={admin.name || "User avatar"}
                                        width={32}
                                        height={32}
                                        className="h-full w-full rounded-full object-cover"
                                    />
                                ) : (
                                    <Image
                                        src={ASSETS()[1].src}
                                        alt={ASSETS()[1].alt}
                                        width={32}
                                        height={32}
                                        className="h-full w-full rounded-full object-cover"
                                    />
                                )}
                            </div>

                            {/* User info — hidden on mobile, avatar + chevron only */}
                            <div className="hidden min-w-0 flex-col items-start sm:flex">
                                <span className="max-w-[140px] truncate text-xs font-medium capitalize text-slate-900">
                                    {loading ? "Loading..." : displayName}
                                </span>
                                <span className="max-w-[140px] truncate text-[11px] text-[#4B5563]">
                                    {loading ? "..." : role}
                                </span>
                            </div>

                            <ChevronDown size={15} strokeWidth={1.8} className="hidden shrink-0 text-slate-400 sm:block" />
                        </div>
                    }
                >
                    <DropdownItem
                        label="Edit Profile"
                        icon={User}
                        href={isUser ? "/user-dashboard/settings" : "/dashboard/settings?tab=profile"}
                    />

                    <div className="my-1 h-px bg-slate-100" />

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50"
                    >
                        <LogOut size={16} />
                        <span>Log out</span>
                    </button>
                </Dropdown>
            </div>
        </header>
    );
}