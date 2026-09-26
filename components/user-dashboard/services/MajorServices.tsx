import { servicesGridData } from "@/data/user-dashboard/serivcesGridData";
import ServiceCard from "./ServiceCard";
import { ChevronRight } from "lucide-react";

const MajorServices = () => {
  return (
    <div className="h-full w-full flex flex-col gap-brand-12x rounded-brand-12 border border-border-clr bg-white p-brand-12 default-transition">
      {/* Header */}
      <div className="flex items-center justify-between gap-brand-8 mb-brand-12">
        <div className="flex flex-col gap-1">
          <h2 className="text-[14px] font-semibold text-text-dark">
            Premium Services
          </h2>

          <p className="para-tiny text-text-secondary-muter">
            Quick access to our most popular services
          </p>
        </div>

        {/* <button
          type="button"
          className="flex items-center gap-1 para-small font-medium text-primary default-transition transition-opacity hover:opacity-70 cursor-pointer group"
        >
          View all
          <ChevronRight size={16} className="group-hover:translate-x-0.5 default-transition" />
        </button> */}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-brand-12 mb-brand-12">
        {servicesGridData.slice(0, 12).map((service) => (
          <ServiceCard
            key={service.id}
            {...service}
          />
        ))}
      </div>

      {/* bottom cta */}
      <div className="flex self-center items-center gap-1 rounded-brand-8 bg-primary/5 px-4 py-2">
        <button
          type="button"
          className="flex items-center gap-1 para-tiny font-medium text-primary default-transition transition-opacity hover:opacity-70 cursor-pointer group"
        >
          View all Services
          <ChevronRight size={16} className="group-hover:translate-x-0.5 default-transition" />
        </button>
      </div>
    </div>
  );
};

export default MajorServices;