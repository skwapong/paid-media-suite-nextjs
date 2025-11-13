'use client';

import AppLayoutClient from '@/components/AppLayoutClient';
import PerformanceDashboard from '@/components/dashboard/PerformanceDashboard';

export default function PerformancePage() {
  return (
    <AppLayoutClient>
      <PerformanceDashboard />
    </AppLayoutClient>
  );
}
