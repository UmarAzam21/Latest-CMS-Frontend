import { useEffect, useState } from 'react';
import { getAdminAuthHeaders } from '@/lib/auth';

export interface DashboardStats {
  total_pages?: number;
  new_messages?: number;
  last_content_update?: {
    label: string;
    time: string;
  };
  seo_health_score?: number;
  admin_leads?: number;
  active_services?: number;
  pending_queries?: number;
  upcoming_deadlines?: number;
  forms_in_progress?: number;
  users_chart_data?: Array<{
    day: string;
    users: number;
  }>;
  recent_activity?: Array<{
    title: string;
    detail: string;
  }>;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const isUserRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/user-dashboard');

        if (isUserRoute) {
          setStats({
            active_services: 0,
            pending_queries: 0,
            upcoming_deadlines: 0,
            forms_in_progress: 0,
          });
          return;
        }

        const res = await fetch('/api/admin/dashboard', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
          headers: {
            Accept: 'application/json',
            ...getAdminAuthHeaders(),
          },
        });

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            setStats({
              total_pages: 0,
              new_messages: 0,
              seo_health_score: 0,
              admin_leads: 0,
              recent_activity: [],
            });
            return;
          }

          throw new Error(`Failed to fetch dashboard stats: ${res.status}`);
        }

        const data = (await res.json()) as DashboardStats;
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
        setError(err instanceof Error ? err.message : 'Unable to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}
