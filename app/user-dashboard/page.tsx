"use client";

import { Suspense } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import MajorServices from '@/components/user-dashboard/services/MajorServices';
import Inbox from '@/components/user-dashboard/services/Inbox';
import Outbox from '@/components/user-dashboard/services/Outbox';
import Notices from '@/components/user-dashboard/services/Notices';
import { useExpenseManagerStore } from '@/hooks/useExpenseManagerStore';
import AdvancedExpenseWorkspaceV2 from '@/components/user-dashboard/expenseManager/overview/AdvanceExpenseWorkspaceV2';
import PromoBanner from '@/components/user-dashboard/expenseManager/promoBanner/PromoBanner';
import DigitalKhataDashboardCard from '@/components/user-dashboard/expenseManager/khata/DigitalKhataDashboardCard';
import FbrTaskBoard from '@/components/user-dashboard/FbrTaskBoard';
import { Filter } from 'lucide-react';

// type DashboardTab = 'inbox' | 'outbox' | 'notices';


type DashboardTab = 'inbox' | 'draft' | 'outbox' | 'completed';

const dashboardTabs: Array<{ key: DashboardTab; label: string }> = [
  { key: 'inbox', label: 'Inbox' },
  { key: 'draft', label: 'Draft' },
  { key: 'outbox', label: 'Outbox' },
  { key: 'completed', label: 'Completed' },
];

function getDashboardTab(value: string | null): DashboardTab {
  return dashboardTabs.some((tab) => tab.key === value) ? value as DashboardTab : 'inbox';
}

function DashboardOverviewContent() {
  const { stats, loading, error } = useDashboardStats();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const serviceName = searchParams.get('service') || undefined;
  const tabsSectionRef = useRef<HTMLElement>(null);
  // const [activeTab, setActiveTab] = useState<DashboardTab>(requestedTab === 'outbox' || requestedTab === 'notices' ? requestedTab : 'inbox');
  const [activeTab, setActiveTab] = useState<DashboardTab>(getDashboardTab(requestedTab));
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const store = useExpenseManagerStore();

  useEffect(() => {
    const nextTab = getDashboardTab(requestedTab)

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



  // const tabContent = {
  //   inbox: <Inbox serviceName={serviceName} onSubmitted={() => setActiveTab('outbox')} />,
  //   outbox: <Outbox />,
  //   notices: <Notices />,
  // };

  const tabContent = <FbrTaskBoard mode={activeTab} isFilterOpen={isFilterOpen} onCloseFilter={() => setIsFilterOpen(false)} />;

  return (
    <div>
      <div className="pb-2 mb-3 border-b border-slate-200">
        <h1 className="heading-h6 text-sm leading-tight">
          Welcome Back, <span className="text-primary">User!</span>
        </h1>
      </div>

      {error && (
        <div className="my-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="py-2x">
        <PromoBanner />
      </div>

      <div className="w-full grid grid-cols-1 gap-brand-12 sm:grid-cols-2 lg:grid-cols-3 mt-brand-12">
        <div className="h-full lg:col-span-2">
          <MajorServices />
        </div>
        <DigitalKhataDashboardCard
          entries={store.entries}
          categories={store.categories}
          cards={store.cards}
          onSaved={(v) => store.addEntry({ ...v, categoryId: v.categoryId || "cat-other" })}
        />
      </div>

      {/* Inbox Draft Tabs */}
      {/* <section ref={tabsSectionRef} className="mt-brand-12 scroll-mt-20 rounded-brand-12 border border-border-clr bg-white p-brand-12 shadow-card">
        <div className="mb-4 flex items-center gap-1 border-b border-border-clr" role="tablist" aria-label="Dashboard messages">
          {(['inbox', 'outbox', 'notices'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-3 py-2 para-small font-medium capitalize default-transition ${activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-primary'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {tabContent[activeTab]}
      </section> */}

      <section ref={tabsSectionRef} className="mt-brand-12 scroll-mt-20 rounded-brand-12 border border-border-clr bg-white p-brand-12 shadow-card">
        <div className="mb-4 flex items-center justify-between gap-4 border-b border-border-clr" role="tablist" aria-label="Dashboard messages">
          <div className="flex min-w-0 items-center gap-1 overflow-x-auto">
            {dashboardTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`shrink-0 px-3 py-2 para-small font-medium capitalize default-transition ${activeTab === tab.key
                  ? 'rounded-t-brand-8  bg-primary text-white'
                  : 'rounded-t-brand-8  bg-[#FAFAFA] border border-border-clr text-black '
                  }`}>
                {tab.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setIsFilterOpen((open) => !open)}
            aria-expanded={isFilterOpen}
            className="mb-1 flex shrink-0 items-center gap-2 rounded-brand-8 bg-primary px-4 py-2 text-xs font-bold uppercase text-white shadow-primary-btn default-transition hover:bg-primary-light">
            <Filter size={15} />
            Filters
          </button>
        </div>
        {tabContent}
      </section>

      {/* <AdvancedExpenseWorkspaceV2
        entries={store.entries}
        categories={store.categories}
        cards={store.cards}
        onSaved={(values) => store.addEntry(values)}
      /> */}
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
