import React from "react";
import Link from "next/link";
import { ChartBar, Crown, type Icon as PhosphorIcon } from "@phosphor-icons/react";

export type Service = {
  title: string;
  icon: PhosphorIcon;
  href?: string;
  iconSrc?: string;
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
    <section className="flex h-full min-w-0 flex-col rounded-2xl border border-border-clr bg-white p-4 ">
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

export function ServiceCard({ title, icon: Icon, iconSrc, href = "#" }: Service) {
  return (
    <Link
      href={href}
      className="
        group flex h-full min-h-[px] w-full flex-col items-center justify-center border border-border-clr
        rounded-2xl   text-center bg-text-secondary-muter/8 p-2  transition-all duration-200
      "
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-md">
        {iconSrc ? (
          <img src={iconSrc} alt="" aria-hidden="true" className="h-12 w-12 object-contain" />
        ) : (
          <Icon className="h-12 w-12 text-primary" weight="fill" />
        )}
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
      {services.map(({ title, icon: Icon, iconSrc, href = "#" }, i) => {
        const isLastInRow = (i + 1) % columns === 0;
        const isLastRow = i >= lastRowStart;

        return (
          <Link
            key={title}
            href={href}
            className={[
              "group flex flex-col items-center justify-center gap-2 px-2 py-4 text-center",
              "transition-colors duration-200 hover:bg-primary/5",
              !isLastInRow && "border-r border-primary/15",
              !isLastRow && "border-b border-primary/15",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {iconSrc ? (
              <img
                src={iconSrc}
                alt=""
                aria-hidden="true"
                className="h-12 w-12 object-contain transition-transform duration-200 group-hover:scale-110"
              />
            ) : (
              <Icon
                className="h-12 w-12 text-primary transition-transform duration-200 group-hover:scale-110"
                weight="fill"
              />
            )}
            <span className="para-tiny font-medium text-text-dark">{title}</span>
          </Link>
        );
      })}
    </div>
  );
}