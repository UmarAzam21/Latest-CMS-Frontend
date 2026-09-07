"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Camera } from "lucide-react";
import { getAdminAuthHeaders } from "@/lib/auth";

interface ProfileForm {
  name: string;
  email: string;
  phone: string;
  designation: string;
  bio: string;
  avatar: string;
  role: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

type AdminProfileApi = {
  id?: string | number;
  name?: string;
  email?: string;
  role?: string;
  phone?: string;
  phone_number?: string;
  designation?: string;
  bio?: string;
  profile_image?: string;
  avatar?: string;
  image_url?: string;
  username?: string;
};

type EditProfileProps = {
  isUser?: boolean;
};

export default function EditProfilePage({ isUser = false }: EditProfileProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [profile, setProfile] = useState<ProfileForm>({
    name: "",
    email: "",
    phone: "",
    designation: "",
    bio: "",
    avatar: "",
    role: "",
  });

  const [password, setPassword] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(isUser ? "/auth/me" : "/api/admin/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: {
            Accept: "application/json",
            ...getAdminAuthHeaders(),
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to load profile: ${res.status}`);
        }

        const data = (await res.json()) as AdminProfileApi;

        setProfile({
          name: isUser ? data.username || "" : data.name || "",
          email: data.email || "",
          phone: data.phone || data.phone_number || "",
          designation: isUser ? "" : data.designation || data.role || "",
          bio: data.bio || "",
          avatar: data.profile_image || data.avatar || data.image_url || "",
          role: data.role || (isUser ? "User" : ""),
        });
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Unable to load profile");
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [isUser]);

  const updateProfile = (field: keyof Omit<ProfileForm, "email" | "role">, value: string) => {
    setProfile((p) => ({ ...p, [field]: value }));
  };

  const updatePassword = (field: keyof PasswordForm, value: string) => {
    setPassword((p) => ({ ...p, [field]: value }));
  };

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/admin/profile/upload-image", {
        method: "POST",
        credentials: "include",
        headers: {
          ...getAdminAuthHeaders(),
        },
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadData?.error || "Image upload failed");
      }

      const imageUrl =
        uploadData?.image_url ||
        uploadData?.profile_image ||
        uploadData?.avatar ||
        URL.createObjectURL(file);

      setProfile((p) => ({ ...p, avatar: imageUrl }));
      setSuccess("Profile image updated successfully.");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Image upload failed");
    }
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    // Only validate password if user is trying to update it (newPassword is filled)
    if (password.newPassword) {
      if (password.newPassword !== password.confirmPassword) {
        setError("New password and confirm password do not match.");
        return;
      }
      if (password.newPassword.length < 8) {
        setError("New password must be at least 8 characters long.");
        return;
      }
      if (!password.currentPassword) {
        setError("Current password is required to set a new password.");
        return;
      }
    }

    try {
      setSaving(true);

      const payload: Record<string, unknown> = isUser
        ? {
            username: profile.name,
            email: profile.email,
            phone: profile.phone,
          }
        : {
            name: profile.name,
            phone_number: profile.phone,
            bio: profile.bio,
          };

      if (!isUser && profile.designation) {
        payload.designation = profile.designation;
      }

      if (!isUser && profile.avatar) {
        payload.profile_image = profile.avatar;
      }

      if (!isUser && password.newPassword && password.currentPassword) {
        payload.current_password = password.currentPassword;
        payload.new_password = password.newPassword;
      }

      const res = await fetch(isUser ? "/auth/me" : "/api/admin/profile", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Unable to update profile");
      }

      if (isUser && password.newPassword && password.currentPassword) {
        const passwordRes = await fetch("/auth/change-password", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...getAdminAuthHeaders(),
          },
          body: JSON.stringify({
            current_password: password.currentPassword,
            new_password: password.newPassword,
          }),
        });

        const passwordData = await passwordRes.json();
        if (!passwordRes.ok) {
          throw new Error(passwordData?.detail || passwordData?.error || "Unable to change password");
        }
      }

      setPassword({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setSuccess("Your profile updated");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 transition-shadow duration-200 hover:shadow-md">
        <h3 className="text-[15px] font-bold text-[#111827]">Edit Profile</h3>
        <p className="mt-1 text-[12px] text-slate-500">
          Update your personal details and public profile info.
        </p>

        <div className="my-4 border-t border-slate-200" />

        {error && (
          <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-600">
            {error}
          </p>
        )}
        {success && (
          <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-600">
            {success}
          </p>
        )}

        <div className="flex flex-col items-center gap-2">
          <div className="group relative h-20 w-20">
            {profile.avatar ? (
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#FEF2F2] text-[20px] font-bold text-[#c8102e]">
                <Image
                  src={profile.avatar}
                  alt={profile.name || "Profile avatar"}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FEF2F2] text-[20px] font-bold text-[#c8102e]">
                {profile.name ? profile.name.charAt(0).toUpperCase() : "A"}
              </div>
            )}

            {!isUser && (
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#c8102e] text-white shadow-sm transition-transform duration-150 hover:scale-110 active:scale-95"
                aria-label="Change photo"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {!isUser && (
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarSelect}
              className="hidden"
            />
          )}

          {!isUser && (
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="text-[11px] font-semibold text-[#c8102e] transition-colors duration-150 hover:underline"
            >
              Change Photo
            </button>
          )}
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-[12px] font-semibold text-[#111111]">
              {isUser ? "Username" : "Full Name"}
            </label>
            <input
              value={profile.name}
              onChange={(e) => updateProfile("name", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-[12px] transition-all duration-150 outline-none focus:border-[#c8102e] focus:ring-2 focus:ring-[#c8102e]/20 hover:border-slate-300"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-[12px] font-semibold text-[#111111]">Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] text-slate-500 outline-none"
              />
              <p className="mt-1 text-[10px] text-slate-500">
                Email is locked and cannot be changed.
              </p>
            </div>

            <div>
              <label className="text-[12px] font-semibold text-[#111111]">Phone Number</label>
              <input
                value={profile.phone}
                onChange={(e) => updateProfile("phone", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-[12px] transition-all duration-150 outline-none focus:border-[#c8102e] focus:ring-2 focus:ring-[#c8102e]/20 hover:border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="text-[12px] font-semibold text-[#111111]">Role</label>
            <input
              value={profile.role}
              disabled
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] text-slate-500 outline-none"
            />
            <p className="mt-1 text-[10px] text-slate-500">
              Role is locked and cannot be changed.
            </p>
          </div>

          <div>
            <label className="text-[12px] font-semibold text-[#111111]">Designation / Role</label>
            <input
              value={profile.designation}
              onChange={(e) => updateProfile("designation", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-[12px] transition-all duration-150 outline-none focus:border-[#c8102e] focus:ring-2 focus:ring-[#c8102e]/20 hover:border-slate-300"
            />
          </div>

          <div>
            <label className="text-[12px] font-semibold text-[#111111]">Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => updateProfile("bio", e.target.value)}
              className="mt-1 min-h-20 w-full rounded-lg border border-slate-200 px-3 py-2 text-[12px] transition-all duration-150 outline-none focus:border-[#c8102e] focus:ring-2 focus:ring-[#c8102e]/20 hover:border-slate-300"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 transition-shadow duration-200 hover:shadow-md">
        <h3 className="text-[12px] font-bold text-[#111827]">Change Password</h3>
        <p className="mt-1 text-[12px] text-slate-500">
          Leave blank if you do not want to update your password.
        </p>

        <div className="my-4 border-t border-slate-200" />

        <div className="space-y-4">
          <div>
            <label className="text-[12px] font-semibold text-[#111111]">Current Password</label>
            <input
              type="password"
              value={password.currentPassword}
              onChange={(e) => updatePassword("currentPassword", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-[12px] transition-all duration-150 outline-none focus:border-[#c8102e] focus:ring-2 focus:ring-[#c8102e]/20 hover:border-slate-300"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-[12px] font-semibold text-[#111111]">New Password</label>
              <input
                type="password"
                value={password.newPassword}
                onChange={(e) => updatePassword("newPassword", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-[12px] transition-all duration-150 outline-none focus:border-[#c8102e] focus:ring-2 focus:ring-[#c8102e]/20 hover:border-slate-300"
              />
            </div>

            <div>
              <label className="text-[12px] font-semibold text-[#111111]">Confirm New Password</label>
              <input
                type="password"
                value={password.confirmPassword}
                onChange={(e) => updatePassword("confirmPassword", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-[12px] transition-all duration-150 outline-none focus:border-[#c8102e] focus:ring-2 focus:ring-[#c8102e]/20 hover:border-slate-300"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Link
          href={isUser ? "/user-dashboard" : "/dashboard"}
          className="rounded-lg border border-slate-200 px-6 py-2.5 text-[12px] font-semibold text-slate-600 transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 active:scale-95"
        >
          Cancel
        </Link>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="rounded-lg bg-[#c8102e] px-6 py-2.5 text-[12px] font-bold text-white transition-all duration-150 hover:bg-[#a80d26] hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}