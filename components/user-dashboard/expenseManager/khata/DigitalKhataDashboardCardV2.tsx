import React from "react";
import Link from "next/link";
import {
  CalendarDays,
  Briefcase,
  HandCoins,
  Trash2,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

type KhataCard = {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
};

const cards: KhataCard[] = [
  {
    title: "Daily Khata",
    description: "Record your daily sales and spending.",
    icon: CalendarDays,
    href: "/user-dashboard/digital-khata/daily",
  },
  {
    title: "Business Khata",
    description: "Track your business accounts in one place.",
    icon: Briefcase,
    href: "/user-dashboard/digital-khata/business",
  },
  {
    title: "Udhar Khata",
    description: "Manage credit given and payments due.",
    icon: HandCoins,
    href: "/user-dashboard/digital-khata/udhaar",
  },
  {
    title: "Recycle Bin",
    description: "Restore deleted entries anytime.",
    icon: Trash2,
    href: "#",
  },
];

function DigitalKhataDashboardCardV2() {
  return (
    <div className="grid h-full min-h-0 grid-cols-2 grid-rows-[repeat(2,minmax(0,1fr))] gap-3">
      {cards.map(({ title, description, icon: Icon, href }) => (
        <Link
          key={title}
          href={href}
          className={`
            group relative flex min-h-0 flex-col justify-between overflow-hidden
            rounded-2xl border border-primary/20 bg-primary-lighter p-4 text-text-dark
            shadow-[0_2px_8px_rgba(17,17,17,0.05)] transition-all duration-200
            hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_8px_20px_rgba(200,16,46,0.10)]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
          `}
        >
          <div className="relative flex items-center justify-between">
            <div className="flex h-6 w-6 items-center justify-center rounded-xl bg-white/80 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
              <Icon className="h-[16px] w-[16px]" strokeWidth={2} />
            </div>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/70 text-text-secondary transition-all group-hover:bg-white group-hover:text-primary">
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
            </span>
          </div>

          <div className="relative mt-2">
            <h3 className="para-small font-semibold leading-tight">{title}</h3>
            <p className="mt-1.5 para-tiny leading-snug text-text-secondary-muted">
              {description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default DigitalKhataDashboardCardV2;