// dashboard\components\user-dashboard\expenseManager\ui\FormKit.tsx

import { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

const base = "w-full rounded-brand-8 border border-border-clr bg-white py-2.5 para-small text-text-dark placeholder:text-text-secondary-muter outline-none default-transition focus:border-primary focus:ring-2 focus:ring-primary/10";
export const inputCls = `${base} pl-9 pr-2.5`;   // with icon
export const inputPlainCls = `${base} px-2.5`;   // no icon (textarea)

export function Field({ label, hint, error, required, group, children }: {
  label: string; hint?: string; error?: string; required?: boolean; group?: boolean; children: ReactNode;
}) {
  const Root = group ? "div" : "label";
  return (
    <Root className="flex flex-col gap-1">
      <span className="para-tiny font-semibold text-text-dark">
        {label}{required && <span className="text-danger"> *</span>}
      </span>
      {children}
      {error
        ? <span className="para-tiny text-danger">{error}</span>
        : hint ? <span className="para-tiny text-text-secondary-muter">{hint}</span> : null}
    </Root>
  );
}

// Positions an icon (or a text prefix like "Rs") inside an input/select.
export function IconBox({ icon: Icon, prefix, children }: { icon?: LucideIcon; prefix?: string; children: ReactNode }) {
  return (
    <div className="relative">
      {Icon && <Icon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-muter" />}
      {prefix && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 para-tiny font-semibold text-text-secondary">{prefix}</span>}
      {children}
    </div>
  );
}