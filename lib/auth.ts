const ADMIN_TOKEN_STORAGE_KEY = "filernow_admin_token";
const ADMIN_USER_STORAGE_KEY = "filernow_admin_user";

// A single module permission entry as sent by the backend, e.g. { "xlsx_import": "update" }
export type ModuleGrant = Record<string, string>;

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  /**
   * Real permission data from the backend (GET /api/admin/me).
   * Either the literal string "*" wrapped in an array (superadmin / full access)
   * or a list of { module_key: "read" | "update" } grants.
   * Optional because it may not be populated until fetchAndStoreAdminProfile() runs.
   */
  modules?: (ModuleGrant | string)[];
  is_superadmin?: boolean;
}

export function getStoredAdminToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredAdminToken(token: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (token) {
      window.localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
      return;
    }

    window.localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
  } catch {
    // Ignore storage errors and continue without persisting the token.
  }
}

export function getStoredAdminUser(): AdminUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const user = window.localStorage.getItem(ADMIN_USER_STORAGE_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function setStoredAdminUser(user: AdminUser | null) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (user) {
      window.localStorage.setItem(ADMIN_USER_STORAGE_KEY, JSON.stringify(user));
      return;
    }

    window.localStorage.removeItem(ADMIN_USER_STORAGE_KEY);
  } catch {
    // Ignore storage errors and continue without persisting the user.
  }
}

export function getAdminAuthHeaders(): Record<string, string> {
  const token = getStoredAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getCurrentAdminUser(): AdminUser | null {
  return getStoredAdminUser();
}

function normalizeRoleValue(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\s_-]+/g, '')
    .trim();
}

export function hasRole(requiredRoles: string[]): boolean {
  const user = getCurrentAdminUser();
  if (!user || !user.role) return false;

  const userRole = normalizeRoleValue(user.role);

  return requiredRoles.some((role) => normalizeRoleValue(role) === userRole);
}

export function isSuperAdmin(): boolean {
  const user = getCurrentAdminUser();
  if (!user) return false;
  const role = normalizeRoleValue(user.role);
  return Boolean(user.is_superadmin) || role === "superadmin";
}

/**
 * Fetches the current admin's real permission set from the backend
 * (the same data get_current_admin() computes server-side) and merges it
 * into the locally stored user. Call this once after login and again on
 * app/sidebar mount so hasModuleAccess() always has fresh, real data
 * instead of guessing from the role name.
 */
export async function fetchAndStoreAdminProfile(): Promise<AdminUser | null> {
  const token = getStoredAdminToken();
  if (!token) return null;

  try {
    const res = await fetch("/api/admin/me", {
      headers: { ...getAdminAuthHeaders(), Accept: "application/json" },
    });
    if (!res.ok) return null;

    const data = await res.json();
    const existing = getStoredAdminUser();
    const modules = Array.isArray(data.modules)
      ? data.modules
      : Array.isArray(data.permissions)
        ? data.permissions
        : existing?.modules;

    const updated: AdminUser = {
      id: String(data.id ?? existing?.id ?? ""),
      email: String(data.email ?? existing?.email ?? ""),
      name: String(data.name ?? existing?.name ?? ""),
      role: String(data.role ?? existing?.role ?? ""),
      modules: Array.isArray(modules) ? modules : existing?.modules,
      is_superadmin: Boolean(data.is_superadmin ?? existing?.is_superadmin),
    };

    setStoredAdminUser(updated);
    return updated;
  } catch {
    // Network/auth error — keep whatever was already stored, don't wipe it out.
    return getStoredAdminUser();
  }
}

const ACCESS_HIERARCHY: Record<string, string[]> = {
  read: ["read", "update", "all"],
  update: ["update", "all"],
};

/**
 * Checks whether the current admin has the required access level for a
 * given backend module key (e.g. "xlsx_import", "pages", "settings",
 * "support_system") — NOT the display label shown in the sidebar.
 * Mirrors the same "update implies read" logic as require_module_access()
 * in the backend's auth.py.
 */
export function hasModuleAccess(moduleKey: string, required: "read" | "update" = "read"): boolean {
  const user = getCurrentAdminUser();
  if (!user) return false;

  if (isSuperAdmin()) return true;

  const modules = user.modules ?? [];
  if (modules.includes("*" as any)) return true;

  const allowedLevels = ACCESS_HIERARCHY[required] ?? [required];

  return modules.some((entry) => {
    if (typeof entry === "string") {
      // A bare module name is a direct grant for that module, equivalent to
      // full access for both read and update checks.
      return entry === moduleKey;
    }
    const level = entry[moduleKey];
    if (!level) return false;
    return allowedLevels.includes(level.toLowerCase());
  });
}

export function canReadModule(moduleKey: string): boolean {
  return hasModuleAccess(moduleKey, "read");
}

export function canUpdateModule(moduleKey: string): boolean {
  return hasModuleAccess(moduleKey, "update");
}