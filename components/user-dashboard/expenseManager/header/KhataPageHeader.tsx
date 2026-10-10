// dashboard\components\user-dashboard\expenseManager\header\KhataPageHeader.tsx

"use client";
import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import DataModeToggler from "../modeToggler/DataModeToggler";

export interface KhataTab { key: string; label: string; icon?: LucideIcon }

interface Props {
    title: string;
    subtitle?: string;
    backHref?: string;
    actions?: ReactNode;
    tabs?: KhataTab[];
    activeTab?: string;
    onTabChange?: (key: string) => void;
    hideDataMode?: boolean; // hide on detail pages (switching data there would orphan the page)
}

export default function KhataPageHeader({ title, subtitle, backHref, actions, tabs, activeTab, onTabChange, hideDataMode }: Props) {
    return (
        <header className="border-b border-border-clr">
            <div className="flex flex-wrap items-center justify-between gap-brand-8 pb-brand-8">
                <div className="flex min-w-0 items-center gap-2">
                    {backHref && (
                        <Link href={backHref} aria-label="Wapis jayein"
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-brand-8 border border-border-clr text-text-secondary hover:bg-page-bg">
                            <ArrowLeft size={16} />
                        </Link>
                    )}
                    <div className="min-w-0">
                        <h1 className="heading-h6 truncate">{title}</h1>
                        {subtitle && <p className="truncate para-tiny text-text-secondary-muter">{subtitle}</p>}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-brand-8">
                    {!hideDataMode && <DataModeToggler />}
                    {actions}
                </div>
            </div>

            {tabs && (
                <nav role="tablist" className="-mb-px flex gap-1 overflow-x-auto">
                    {tabs.map((t) => {
                        const active = t.key === activeTab;
                        const Icon = t.icon;
                        return (
                            <button key={t.key} type="button" role="tab" aria-selected={active} onClick={() => onTabChange?.(t.key)}
                                className={cn(
                                    "flex shrink-0 cursor-pointer items-center gap-1.5 border-b-2 px-3 py-2 para-small font-medium default-transition",
                                    active ? "border-primary text-primary" : "border-transparent text-text-secondary hover:text-text-dark"
                                )}>
                                {Icon && <Icon size={15} />}{t.label}
                            </button>
                        );
                    })}
                </nav>
            )}
        </header>
    );
}