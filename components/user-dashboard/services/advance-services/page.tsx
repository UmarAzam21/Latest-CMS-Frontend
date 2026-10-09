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
  { title: "Consultancy", icon: Scales },
  { title: "E-invoice", icon: FileText },
  { title: "POS", icon: Desktop },
  { title: "Manufacturing", icon: Factory },
  { title: "AI Deny", icon: Sparkle },
  { title: "Accounting", icon: Calculator },
];

const AdvancedServices = () => (
  <ServicePanel title="Advance" premium showDashboard={false}>
    <DividedServiceGrid services={services} />
  </ServicePanel>
);

export default AdvancedServices;