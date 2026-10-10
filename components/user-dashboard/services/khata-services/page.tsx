import React from "react";
import { Users, Wallet, Package, Receipt, IdentificationBadge, Money } from "@phosphor-icons/react";
import { ServiceCard, ServicePanel, type Service } from "@/components/user-dashboard/services/services-ui";

const services: Service[] = [
  { title: "Party", icon: Users, iconSrc: "/Party-07.svg", href: "/user-dashboard/digital-khata/party" },
  { title: "Cash", icon: Wallet, iconSrc: "/Cash-08.svg", href: "/user-dashboard/digital-khata/business?tab=cash" },
  { title: "Stock", icon: Package, iconSrc: "/Stock-09.svg", href: "/user-dashboard/digital-khata/business?tab=stock" },
  { title: "Bills", icon: Receipt, iconSrc: "/Bills-10.svg", href: "/user-dashboard/digital-khata/business?tab=bill" },
  { title: "Staff", icon: IdentificationBadge, iconSrc: "/Staff-11.svg", href: "/user-dashboard/digital-khata/business" },
  { title: "Expense", icon: Money, iconSrc: "/Expense-12.svg", href: "/user-dashboard/digital-khata/daily" },
];

const KhataServices = () => (
  <ServicePanel title="Khata" viewAllHref="/user-dashboard/digital-khata/daily">
    <div className="grid w-full max-w-[96%] grid-cols-3 grid-rows-2 gap-4 self-center">
      {services.map((s) => (
        <ServiceCard key={s.title} {...s} />
      ))}
    </div>
  </ServicePanel>
);

export default KhataServices;