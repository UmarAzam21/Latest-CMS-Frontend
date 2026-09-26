import type { LucideIcon } from "lucide-react";
import { Building2, Landmark, Wallet } from "lucide-react";

export const DIGITAL_KHATA_ROUTES = {
  daily: { label: "Daily Khata", href: "/user-dashboard/digital-khata/daily" },
  business: { label: "Business Khata", href: "/user-dashboard/digital-khata/business" },
  udhaar: { label: "Udhaar Khata", href: "/user-dashboard/digital-khata/udhaar" },
} as const;

export type DigitalKhataRouteKey = keyof typeof DIGITAL_KHATA_ROUTES;

export const DIGITAL_KHATA_NAV_ITEMS: Array<{
  label: string;
  href: string;
  icon: LucideIcon;
}> = [
  { label: DIGITAL_KHATA_ROUTES.daily.label, href: DIGITAL_KHATA_ROUTES.daily.href, icon: Wallet },
  { label: DIGITAL_KHATA_ROUTES.business.label, href: DIGITAL_KHATA_ROUTES.business.href, icon: Building2 },
  { label: DIGITAL_KHATA_ROUTES.udhaar.label, href: DIGITAL_KHATA_ROUTES.udhaar.href, icon: Landmark },
];
