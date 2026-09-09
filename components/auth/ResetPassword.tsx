"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Toast from "../../components/ui/Toast";
import Link from "next/link";
import { Check, Eye, EyeOff } from "lucide-react";

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const token = searchParams?.get("token") ?? "";
    const [showPassword, setShowPassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const TOAST_DURATION = 3000; // visible time before hiding (ms)

    const passwordChecks = useMemo(() => {
        const length = newPassword.length >= 10;
        const upper = /[A-Z]/.test(newPassword);
        const digit = /\d/.test(newPassword);
        const special = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
        return { length, upper, digit, special };
    }, [newPassword]);

    const passwordStrength = useMemo(() => {
        const passed = Object.values(passwordChecks).filter(Boolean).length;
        if (passed === 4) return "Strong";
        if (passed >= 2) return "Fair";
        return "Weak";
    }, [passwordChecks]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!newPassword.trim() || !confirmPassword.trim()) {
            const msg = "Please fill all the fields.";
            setError(msg);
            setToastMessage(msg);
            setToastVisible(true);
            return;
        }

        if (!token) {
            const msg = "Reset token is missing. Please use the link from your email.";
            setError(msg);
            setToastMessage(msg);
            setToastVisible(true);
            return;
        }

        if (newPassword !== confirmPassword) {
            const msg = "Passwords do not match.";
            setError(msg);
            setToastMessage(msg);
            setToastVisible(true);
            return;
        }

        setError(null);
        setLoading(true);

            try {
            const res = await fetch("/api/proxy/admin/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, new_password: newPassword }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `Request failed with status ${res.status}`);
            }

            const data = await res.json();
            console.log("Reset success:", data);
            const successMsg = data?.detail || "Password has been reset successfully.";
            setToastMessage(successMsg);
            setToastVisible(true);
            // clear fields
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            const raw = err?.message || "Login failed";

            // Try to parse JSON responses like {"detail":"..."}
            let friendly = "Login failed. Please try again.";
            try {
                const parsed = JSON.parse(raw);
                if (parsed && parsed.detail) {
                    const detail = String(parsed.detail);
                    if (/invalid email|invalid password|invalid email or password/i.test(detail)) {
                        friendly = "Invalid email or password.";
                    } else {
                        friendly = detail;
                    }
                } else if (typeof parsed === 'string') {
                    friendly = parsed;
                }
            } catch (e) {
                // not JSON — derive a nicer message from raw text
                if (/invalid email|invalid password|invalid email or password/i.test(raw)) {
                    friendly = "Invalid email or password.";
                } else if (raw && raw !== 'Login failed') {
                    friendly = raw;
                }
            }

            setError(friendly);
            setToastMessage(friendly);
            setToastVisible(true);
        } finally {
            setLoading(false);
        }
    }

    // no-op

    return (
        <>


            <form onSubmit={handleSubmit} className="mt-8 space-y-5 mb-10">
              

                <div className="space-y-5">
                    <div>
                        <label
                            htmlFor="new-password"
                            className="block text-sm font-medium text-gray-700 mb-1.5"
                        >
                           New Password
                        </label>
                        <div className="relative">
                            <input
                                id="new-password"
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 pr-10 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8102E]/40 focus:border-[#C8102E]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="confirm-password"
                            className="block text-sm font-medium text-gray-700 mb-1.5"
                        >
                           Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                id="confirm-password"
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm password"
                                className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 pr-10 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8102E]/40 focus:border-[#C8102E]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl  p-4 text-sm text-gray-700">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                            <p className="font-medium text-gray-900">Password requirements</p>
                        </div>
                        <span className="text-xs font-semibold text-gray-900">{passwordStrength}</span>
                    </div>

                    <div className="mb-4 h-2.5 w-full rounded-full bg-gray-200 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-300 ${passwordStrength === "Strong" ? "bg-primary" : passwordStrength === "Fair" ? "bg-primary" : "bg-primary"}`}
                            style={{ width: `${(Object.values(passwordChecks).filter(Boolean).length / 4) * 100}%` }}
                        />
                    </div>

                    <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                            <span className={`mt-1 flex h-5 w-5 items-center justify-center rounded-md border ${passwordChecks.length ? "border-[#C8102E] bg-[#C8102E] text-white" : "border-gray-300 bg-white text-gray-400"}`}>
                                {passwordChecks.length ? <Check size={14} /> : ""}
                            </span>
                            <span>At least 10 characters long.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className={`mt-1 flex h-5 w-5 items-center justify-center rounded-md border ${passwordChecks.upper ? "border-[#C8102E] bg-[#C8102E] text-white" : "border-gray-300 bg-white text-gray-400"}`}>
                                {passwordChecks.upper ? <Check size={14} /> : ""}
                            </span>
                            <span>At least one uppercase letter.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className={`mt-1 flex h-5 w-5 items-center justify-center rounded-md border ${passwordChecks.digit ? "border-[#C8102E] bg-[#C8102E] text-white" : "border-gray-300 bg-white text-gray-400"}`}>
                                {passwordChecks.digit ? <Check size={14} /> : ""}
                            </span>
                            <span>At least one digit.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className={`mt-1 flex h-5 w-5 items-center justify-center rounded-md border ${passwordChecks.special ? "border-[#C8102E] bg-[#C8102E] text-white" : "border-gray-300 bg-white text-gray-400"}`}>
                                {passwordChecks.special ? <Check size={14} /> : ""}
                            </span>
                            <span>At least one special character.</span>
                        </li>
                    </ul>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md bg-primary py-3 text-sm font-semibold text-white hover:bg-[#a50d24] transition-colors disabled:opacity-50"
                >
                    {loading ? "Resetting..." : "Save Change"}
                </button>

                {/* Inline error removed — showing top-right toast instead */}

                {/* Toast popup (reusable) */}
                <Toast
                    open={toastVisible}
                    title={"Reset Password"}
                    message={toastMessage || "An error occurred while resetting the password."}
                    duration={TOAST_DURATION}
                    onClose={() => {
                        setToastVisible(false);
                        setError(null);
                        setToastMessage("");
                    }}
                    variant={error ? "error" : "success"}
                />

                <p className="text-center text-xs text-gray leading-relaxed">
                    By signing in, you agree to Filernow{" "}
                    <Link href="/terms" className="text-[#C8102E] hover:underline">
                        Terms &amp; Conditions 
                    </Link>{" "}
                    and Privacy Policy.
                </p>
            </form>
        </>
    );
}

export default function ResetPassword() {
    return (
        <Suspense fallback={<div className="p-6 text-sm text-gray-500">Loading reset form...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}