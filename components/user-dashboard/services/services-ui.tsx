import React from "react";
import Link from "next/link";
import { ChartBar, Crown, type Icon as PhosphorIcon } from "@phosphor-icons/react";

export type Service = {
  title: string;
  icon: PhosphorIcon;
  href?: string;
};

export function ServicePanel({
  title,
  viewAllHref = "#",
  premium = false,
  showDashboard = true,
  children,
}: {
  title: string;
  icon?: PhosphorIcon;
  viewAllHref?: string;
  premium?: boolean;
  showDashboard?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="para-small font-medium text-slate-500">{title}</h2>

        <div className="flex items-center gap-2">
          {premium && (
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary-lighter px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              <Crown className="h-3 w-3" strokeWidth={2.5} />
              Premium
            </span>
          )}
          {showDashboard && (
            <Link
              href={viewAllHref}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <ChartBar className="h-3.5 w-3.5" />
              View Dashboard
            </Link>
          )}
        </div>
      </div>

      {children}
    </section>
  );
}

export function ServiceCard({ title, icon: Icon, href = "#" }: Service) {
  return (
    <Link
      href={href}
      className="
        group flex min-h-[70px] w-[100px]  flex-col items-center justify-center
        rounded-2xl   text-center bg-primary/5 p-3 border border-primary/20 transition-all duration-200
      "
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-md">
        <Icon className="h-6 w-6 text-primary" weight="fill" />
      </div>

      <h3 className="mt-2 para-tiny">
        {title}
      </h3>
    </Link>
  );
}



export function DividedServiceGrid({
  services,
  columns = 3,
}: {
  services: Service[];
  columns?: number;
}) {
  const lastRowStart =
    services.length - (services.length % columns || columns);

  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {services.map(({ title, icon: Icon, href = "#" }, i) => {
        const isLastInRow = (i + 1) % columns === 0;
        const isLastRow = i >= lastRowStart;

        return (
          <Link
            key={title}
            href={href}
            className={[
              "group flex flex-col items-center justify-center gap-2 px-2 py-5 text-center",
              "transition-colors duration-200 hover:bg-primary/5",
              !isLastInRow && "border-r border-primary/15",
              !isLastRow && "border-b border-primary/15",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <Icon
              className="h-8 w-8 text-primary transition-transform duration-200 group-hover:scale-110"
              weight="fill"
            />
            <span className="para-tiny font-medium text-text-dark">{title}</span>
          </Link>
        );
      })}
    </div>
  );
}