"use client";

import { useState, useRef, useEffect } from "react";
import Toast from "../../components/ui/Toast";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from 'next/navigation'
import { setStoredAdminToken, setStoredAdminUser } from '@/lib/auth'

// Helper function to decode JWT and extract claims
function decodeJWT(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

function formatLoginError(value: unknown): string {
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.map(formatLoginError).filter(Boolean).join(" ");
    if (value && typeof value === "object") {
        const item = value as { msg?: unknown; message?: unknown; detail?: unknown; error?: unknown };
        return formatLoginError(item.msg ?? item.message ?? item.detail ?? item.error);
    }
    return "Login failed. Please try again.";
}

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const TOAST_DURATION = 3000;


  const router = useRouter()


    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            const msg = "Please fill all the fields.";
            setError(msg);
            setToastMessage(msg);
            setToastVisible(true);
            return;
        }

        setError(null);
        setLoading(true);

            try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `Request failed with status ${res.status}`);
            }

            const data = await res.json();
            const token = data?.access_token ?? data?.token ?? null;
            
            console.log("Login response data:", data);
            
            // Clear any previous auth data first
            setStoredAdminToken(null);
            setStoredAdminUser(null);
            
            setStoredAdminToken(token);
            
            // Extract role from JWT if available
            let roleFromJWT = null;
            if (token) {
              const decoded = decodeJWT(token);
              console.log("Decoded JWT:", decoded);
              // Try multiple places where role might be stored in JWT
              roleFromJWT = decoded?.role || decoded?.user_role || decoded?.admin_role || decoded?.sub?.role || decoded?.user?.role || null;
            }
            
            // Store user info including role
            // Try multiple sources for role: JWT, response.user, response root level
            const userInfo = {
              id: data.user?.id || data.user?.user_id || data.id || data.user_id || "",
              email: data.user?.email || data.email || email,
              name: data.user?.name || data.user?.full_name || data.name || data.full_name || "",
                            slug: data.user?.slug || data.slug || "",
              role: roleFromJWT || data.user?.role || data.role || "superadmin", // Default to superadmin if not found
              modules: Array.isArray(data.permissions)
                ? data.permissions
                : Array.isArray(data.modules)
                  ? data.modules
                  : undefined,
              is_superadmin: Boolean(data.is_superadmin ?? (roleFromJWT && /superadmin/i.test(roleFromJWT))),
            };
            
            console.log("Storing user info:", userInfo);
            console.log("Role sources - JWT:", roleFromJWT, "Response user:", data.user?.role, "Response root:", data.role);
            setStoredAdminUser(userInfo);
            
            console.log("Login success:", data);
            router.push(userInfo.slug.toLowerCase() === "user" ? "/user-dashboard" : "/dashboard")
        } catch (err: any) {
            const raw = err?.message || "Login failed";

            // Try to parse JSON responses like {"detail":"..."}
            let friendly = "Login failed. Please try again.";
            try {
                const parsed = JSON.parse(raw);
                if (parsed && parsed.detail) {
                    const detail = formatLoginError(parsed.detail);
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

    useEffect(() => {
        return () => {};
    }, []);

    return (
        <>


            <form onSubmit={handleSubmit} className="mt-8 space-y-5 mb-10">
                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                        Email
                    </label>
                    <input
                        id="email"
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter Email or User Name"
                        className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8102E]/40 focus:border-[#C8102E]"
                    />
                </div>

                <div>
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                        Password
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
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

                <div className="flex justify-end">
                    <Link
                        href="/forgot"
                        className="text-sm text-gray-700 hover:text-primary transition-colors"
                    >
                        Forget Password
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md bg-primary py-3 text-sm font-semibold text-white hover:bg-[#a50d24] transition-colors disabled:opacity-50"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

                {/* Inline error removed — showing top-right toast instead */}

                {/* Toast popup (reusable) */}
                <Toast
                    open={toastVisible}
                    title={"Login error"}
                    message={toastMessage || "Invalid email or password."}
                    duration={TOAST_DURATION}
                    onClose={() => {
                        setToastVisible(false);
                        setError(null);
                        setToastMessage("");
                    }}
                    variant="error"
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