import { IParty } from "@/types/expenseManagerTy";

export const PARTY_BASE = "/user-dashboard/digital-khata/party";

// name + 5-char random suffix: readable, and two "Ali"s never collide
export function makeSlug(name: string) {
    const base =
        name
            .toLowerCase()
            .normalize("NFKD")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+\$/g, "")
            .slice(0, 30) || "party";

    return `${base}-${crypto.randomUUID().replace(/-/g, "").slice(0, 5)}`;
}

export const partyHref = (p: Pick<IParty, "slug">, sub = "") =>
    `${PARTY_BASE}/${p.slug}${sub}`;