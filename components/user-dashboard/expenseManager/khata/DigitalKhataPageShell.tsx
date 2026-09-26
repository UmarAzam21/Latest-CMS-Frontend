import Link from "next/link";
import type { ReactNode } from "react";
import { DIGITAL_KHATA_NAV_ITEMS } from "@/data/user-dashboard/digitalKhata";

export default function DigitalKhataPageShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-brand-12">
      <div className="flex items-center justify-between gap-4 border-b border-border-clr pb-brand-8">
        <div>
          <h1 className="heading-h6">{title}</h1>
          {subtitle ? <p className="para-small text-text-secondary">{subtitle}</p> : null}
        </div>

        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>

      <nav className="flex flex-wrap gap-2 rounded-brand-12 border border-border-clr bg-white p-2 shadow-card">
        {DIGITAL_KHATA_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-brand-8 border border-border-clr px-3 py-2 para-small font-medium text-text-secondary transition-colors hover:border-primary hover:text-primary"
            >
              <Icon size={14} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
