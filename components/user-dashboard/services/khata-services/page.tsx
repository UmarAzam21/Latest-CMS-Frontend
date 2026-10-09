import React from "react";
import { Users, Wallet, Package, Receipt, IdentificationBadge, Money } from "@phosphor-icons/react";
import { ServiceCard, ServicePanel, type Service } from "@/components/user-dashboard/services/services-ui";

const services: Service[] = [
  { title: "Party", icon: Users, href: "/user-dashboard/digital-khata/party" },
  { title: "Cash", icon: Wallet, href: "/user-dashboard/digital-khata/business?tab=cash" },
  { title: "Stock", icon: Package, href: "/user-dashboard/digital-khata/business?tab=stock" },
  { title: "Bills", icon: Receipt, href: "/user-dashboard/digital-khata/business?tab=bill" },
  { title: "Staff", icon: IdentificationBadge, href: "/user-dashboard/digital-khata/business" },
  { title: "Expense", icon: Money, href: "/user-dashboard/digital-khata/daily" },
];

const KhataServices = () => (
  <ServicePanel title="Khata" viewAllHref="/user-dashboard/digital-khata/daily">
    <div className="grid grid-cols-2 justify-items-center gap-3 sm:grid-cols-3">
      {services.map((s) => (
        <ServiceCard key={s.title} {...s} />
      ))}
    </div>
  </ServicePanel>
);

export default KhataServices;