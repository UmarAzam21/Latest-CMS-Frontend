import {
  Scales,
  FileText,
  Desktop,
  Factory,
  Sparkle,
  Calculator,
} from "@phosphor-icons/react";
import { DividedServiceGrid, ServicePanel, type Service } from "@/components/user-dashboard/services/services-ui";

const services: Service[] = [
  { title: "Consultancy", icon: Scales, iconSrc: "/Consultancy-06.svg" },
  { title: "E-invoice", icon: FileText, iconSrc: "/Invoicing-05.svg" },
  { title: "POS", icon: Desktop, iconSrc: "/POS-01.svg" },
  { title: "Manufacturing", icon: Factory, iconSrc: "/Manufacturing-04.svg" },
  { title: "AI Deny", icon: Sparkle, iconSrc: "/Ai%20Assistant-03.svg" },
  { title: "Accounting", icon: Calculator, iconSrc: "/Accounting-02.svg" },
];

const AdvancedServices = () => (
  <ServicePanel title="Advance" premium showDashboard={false}>
    <DividedServiceGrid services={services} />
  </ServicePanel>
);

export default AdvancedServices;