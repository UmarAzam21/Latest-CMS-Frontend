"use client";

import { Suspense } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import ExpenseManagerCard from '@/components/user-dashboard/expenseManager/ExpenseManager';
import MajorServices from '@/components/user-dashboard/services/MajorServices';
import ExpensesStatsCard from '@/components/user-dashboard/expenseManager/ExpensesStatsCard';
import DashboardStatCard from '@/components/user-dashboard/expenseManager/DashboardStatCard';
import ExpenseManagerCardV2 from '@/components/user-dashboard/expenseManager/ExpenseManagerCardV2';
import Inbox from '@/components/user-dashboard/services/Inbox';
import Outbox from '@/components/user-dashboard/services/Outbox';
import Notices from '@/components/user-dashboard/services/Notices';

type DashboardTab = 'inbox' | 'outbox' | 'notices';

function DashboardOverviewContent() {
  const { stats, loading, error } = useDashboardStats();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const serviceName = searchParams.get('service') || undefined;
  const tabsSectionRef = useRef<HTMLElement>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>(requestedTab === 'outbox' || requestedTab === 'notices' ? requestedTab : 'inbox');

  useEffect(() => {
    const nextTab: DashboardTab = requestedTab === 'outbox' || requestedTab === 'notices' ? requestedTab : 'inbox';
    setActiveTab(nextTab);

    if (serviceName && nextTab === 'inbox') {
      window.requestAnimationFrame(() => {
        const section = tabsSectionRef.current;
        const main = section?.closest('main');

        if (!section || !main) return;

        const sectionTop = section.getBoundingClientRect().top;
        const mainTop = main.getBoundingClientRect().top;
        const nextScrollTop = main.scrollTop + sectionTop - mainTop - 80;

        main.scrollTo({ top: Math.max(0, nextScrollTop), behavior: 'smooth' });
      });
    }
  }, [requestedTab, serviceName]);

  const tabContent = {
    inbox: <Inbox serviceName={serviceName} />,
    outbox: <Outbox />,
    notices: <Notices />,
  };

  return (
    <div>
      <div className="pb-2 mb-3 border-b border-slate-200">
        <span className="text-xs text-[#4B5563]">Hi,</span>
        <h1 className="text-lg font-bold">
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

      <div className="w-full grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-5">
        <div className="h-full lg:col-span-2">
          <MajorServices />
        </div>
        {/* <div className="h-full">
          <ExpenseManagerCard />
        </div> */}
        <div className="h-full">
          <ExpenseManagerCardV2 />
        </div>
      </div>

      <section ref={tabsSectionRef} className="mt-5 scroll-mt-20 rounded-brand-12 border border-border-clr bg-white p-4 shadow-card">
        <div className="mb-4 flex items-center gap-1 border-b border-border-clr" role="tablist" aria-label="Dashboard messages">
          {(['inbox', 'outbox', 'notices'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-3 py-2 para-small font-medium capitalize default-transition ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-primary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {tabContent[activeTab]}
      </section>

    

    </div>
  );
}

export default function DashboardOverviewPage() {
  return (
    <Suspense fallback={<div className="min-h-40" />}>
      <DashboardOverviewContent />
    </Suspense>
  );
}