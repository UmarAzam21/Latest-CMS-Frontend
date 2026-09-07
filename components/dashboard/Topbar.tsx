"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Search,
  ExternalLink,
  ChevronDown,
  Globe,
  User,
  LogOut,
} from "lucide-react";

import { ASSETS } from "@/lib/assets";
import Dropdown from "@/components/ui/Dropdown";
import DropdownItem from "@/components/ui/DropdownItem";
import NotificationModal from "@/components/ui/NotificationModal";
import { getAdminAuthHeaders, setStoredAdminToken, setStoredAdminUser } from "@/lib/auth";

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

        const res = await fetch(isUser ? "/auth/me" : "/api/admin/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: {
            Accept: "application/json",
            ...getAdminAuthHeaders(),
          },
        });

        console.log("Admin API status:", res.status);

        if (!res.ok) {
          const errorText = await res.text();

          console.error("Admin API error:", errorText);

          if (mounted) {
            setAdmin(null);
          }

          return;
        }

        const data = await res.json();

        console.log("Admin API response:", data);

        /*
         * Backend (MeResponse) returns a flat object:
         *
         * {
         *   "name": "Muhammad Umar",
         *   "email": "uazam3033@gmail.com",
         *   "role": "superadmin",
         *   "permissions": [...]
         * }
         */

        if (data && mounted) {
          setAdmin({
            name: data.name || "",
            username: data.username || "",
            email: data.email || "",
            role: data.role || data.user_role || (isUser ? "User" : "Admin"),
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
        // Clear stored credentials
        setStoredAdminToken(null);
        setStoredAdminUser(null);
        
        // Redirect to login
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

  return (
    <header className="flex h-[60px] items-center justify-between gap-4 border-b border-slate-200 bg-white px-6">
      {/* Search */}
      <div className="relative w-full max-w-sm">
        <Search
          size={16}
          strokeWidth={1.8}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          placeholder={isUser ? "Search your workspace..." : "Search pages, messages, media..."}
          className="h-[35px] w-[360px] rounded-lg border border-slate-200 bg-[#F9FAFB] py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Live Website */}
        <a
          href={
            process.env.NEXT_PUBLIC_SITE_URL || "https://filernow.com"
          }
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          <Globe size={15} strokeWidth={1.8} />

          <span>View Live Site</span>

          <ExternalLink size={15} strokeWidth={1.8} />
        </a>

        {/* Notifications */}
        <NotificationModal userId={admin?.email} />

        {/* Account Dropdown */}
        <Dropdown
          trigger={
            <div className="flex cursor-pointer items-center gap-3 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-primary-light">
              {/* Avatar */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-light text-sm font-semibold text-primary">
                {admin?.profile_image ? (
                  <Image
                    src={admin.profile_image}
                    alt={admin.name || "Admin avatar"}
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

              {/* Admin Information */}
              <div className="flex min-w-0 flex-col items-start gap-0.5">
                <span className="max-w-[180px] truncate text-xs font-medium capitalize text-slate-900">
                  {loading ? "Loading..." : displayName}
                </span>

                <span className="text-[11px] text-[#4B5563]">
                  {loading ? "..." : role}
                </span>
              </div>

              <ChevronDown
                size={15}
                strokeWidth={1.8}
                className="shrink-0 text-slate-400"
              />
            </div>
          }
        >
          <DropdownItem
            label="Edit Profile"
            icon={User}
            href={isUser ? "/user-dashboard/settings" : "/dashboard/settings?tab=profile"}
          />

          <div className="my-1 h-px bg-slate-100" />

          <div
            onClick={handleLogout}
            className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut size={16} />

            <span>Log out</span>
          </div>
        </Dropdown>
      </div>
    </header>
  );
}