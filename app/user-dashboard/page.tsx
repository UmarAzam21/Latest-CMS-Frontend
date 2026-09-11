"use client";

import DraftServices from '@/components/user-dashboard/services/DraftService';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import ExpenseManagerCard from '@/components/user-dashboard/expenseManager/ExpenseManager';
import MajorServices from '@/components/user-dashboard/services/MajorServices';
import ExpensesStatsCard from '@/components/user-dashboard/expenseManager/ExpensesStatsCard';
import DashboardStatCard from '@/components/user-dashboard/expenseManager/DashboardStatCard';
import ExpenseManagerCardV2 from '@/components/user-dashboard/expenseManager/ExpenseManagerCardV2';

export default function DashboardOverviewPage() {
  const { stats, loading, error } = useDashboardStats();

  return (
    <div>
      <div className="pb-2 mb-3 border-b border-slate-200">
        <span className="text-xs text-[#4B5563]">Hi,</span>
        <h1 className="text-md font-bold">
          Welcome Back, <span className="text-primary">User!</span>
        </h1>
      </div>

      {error && (
        <div className="my-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="py-2x">
        <ExpensesStatsCard />
      </div>

      {/* <DashboardStatCard /> */}

      <div className="w-full grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-3">
        <div className="h-full lg:col-span-2x">
          <MajorServices />
        </div>
        <div className="h-full">
          <ExpenseManagerCard />
        </div>
        <div className="h-full">
          <ExpenseManagerCardV2 />
        </div>
      </div>

      <div className="mt-6">

        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-sm font-bold">Quick Access</h1>
        </div>
        <DraftServices variant="user" />
      </div>

    </div>
  );
}