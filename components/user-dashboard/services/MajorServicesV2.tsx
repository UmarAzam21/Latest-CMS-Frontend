import React from "react";
import KhataServices from "@/components/user-dashboard/services/khata-services/page";
import AdvancedServices from "@/components/user-dashboard/services/advance-services/page";

function MajorServicesV2() {
  return (
    <div className="grid w-full grid-cols-1 gap-3 lg:grid-cols-2">
      <KhataServices />
      <AdvancedServices />
    </div>
  );
}

export default MajorServicesV2;