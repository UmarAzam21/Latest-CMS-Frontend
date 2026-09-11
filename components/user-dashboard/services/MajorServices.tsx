import { servicesGridData } from "@/data/user-dashboard/serivcesGridData";
import ServiceCard from "./ServiceCard";
import { ChevronRight } from "lucide-react";

const MajorServices = () => {
  return (
    <div className="h-full w-full flex flex-col rounded-brand-12 border border-border-clr bg-white p-4 shadow-card default-transition hover:shadow-card-hover">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[14px] font-semibold text-text-dark">
            Major Services
          </h2>

          <p className="para-tiny text-text-secondary-muter">
            Quick access to our most popular services
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-1 para-small font-medium text-primary default-transition transition-opacity hover:opacity-70 cursor-pointer group"
        >
          View all
          <ChevronRight size={16} className="group-hover:translate-x-0.5 default-transition" />
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {servicesGridData.slice(0, 8).map((service) => (
          <ServiceCard
            key={service.id}
            {...service}
          />
        ))}
      </div>
    </div>
  );
};

export default MajorServices;