"use client";

import {
  ArchiveRestore,
  Calculator,
  Download,
  FileSpreadsheet,
  type LucideIcon,
} from "lucide-react";

const tools: Array<{
  title: string;
  description: string;
  icon: LucideIcon;
  tone: string;
}> = [
  {
    title: "Calculator",
    description: "Quick calculations for your khata.",
    icon: Calculator,
    tone: "bg-rose-50 text-rose-700",
  },
  {
    title: "Recycle Bin",
    description: "Review and restore deleted records.",
    icon: ArchiveRestore,
    tone: "bg-amber-50 text-amber-700",
  },
  {
    title: "Backup",
    description: "Keep a copy of your khata data.",
    icon: Download,
    tone: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "Khata Warrier",
    description: "Download your records for reporting.",
    icon: FileSpreadsheet,
    tone: "bg-sky-50 text-sky-700",
  },
];

export default function QuickGrids() {
  return (
    <section aria-label="Quick tools" className="h-full">
      <div className="mb-3">
        <h2 className="text-sm font-bold text-[var(--text-dark)]">Quick tools</h2>
        <p className="mt-0.5 text-xs text-gray-500">Useful actions for your khata</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {tools.map(({ title, description, icon: Icon, tone }) => (
          <article
            key={title}
            className="flex min-h-[118px] min-w-0 flex-col rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:border-gray-300 hover:bg-gray-50"
          >
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>
              <Icon aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={1.9} />
            </span>
            <h3 className="mt-3 truncate text-xs font-semibold text-[var(--text-dark)]">
              {title}
            </h3>
            <p className="mt-1 text-[11px] leading-snug text-gray-500">{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}