import React from "react";
import {
  ChevronRight,
  Building2,
  FileText,
  BriefcaseBusiness,
  Building,
  UserCheck,
  Receipt,
  WalletCards,
  Globe2,
} from "lucide-react";

const majorServices = [
  {
    name: "Business NTN",
    icon: Building2,
  },
  {
    name: "Tax Return Filing",
    icon: FileText,
  },
  {
    name: "Business Registration",
    icon: BriefcaseBusiness,
  },
  {
    name: "Company Registration",
    icon: Building,
  },
  {
    name: "Filer Registration",
    icon: UserCheck,
  },
  {
    name: "GST Registration",
    icon: Receipt,
  },
  {
    name: "Wealth Statement",
    icon: WalletCards,
  },
  {
    name: "Import & Export License",
    icon: Globe2,
  },
];

interface MajorServicesProps {
  onServiceClick?: (service: string) => void;
}

const MajorServices: React.FC<MajorServicesProps> = ({
  onServiceClick,
}) => {
  return (
    <div className="flex h-full w-full flex-col rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-semibold text-[#172033]">
            Major Services
          </h2>

          <p className="mt-1 text-[14px] text-[#7A8799]">
            Quick access to our most popular services
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-1 text-[14px] font-medium text-[#c8102e] transition-opacity hover:opacity-70"
        >
          View all
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Services */}
      <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
        {majorServices.map((service) => {
          const Icon = service.icon;

          return (
            <button
              key={service.name}
              type="button"
              onClick={() => onServiceClick?.(service.name)}
              className="group flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/50 px-2 py-3 text-center transition-all duration-200 hover:border-[#c8102e]/20 hover:bg-[#FEF2F2]"
            >
              {/* Icon */}
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-[#FEF2F2] text-[#c8102e] transition-all duration-200 group-hover:bg-[#c8102e] group-hover:text-white">
                <Icon size={20} strokeWidth={1.8} />
              </div>

              {/* Service Name */}
              <span className="text-[13px] font-medium leading-5 text-[#515D6E] transition-colors group-hover:text-[#c8102e]">
                {service.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MajorServices;