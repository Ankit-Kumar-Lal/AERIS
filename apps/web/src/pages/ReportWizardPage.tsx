import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ReportWizard } from '../components/report/ReportWizard';
import { fetchLocations } from '../services/api';
import { LocationItem } from '../types';
import { FilePlus2, Shield } from 'lucide-react';

export const ReportWizardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const villageParam = searchParams.get('village');
  const preselectedId = villageParam ? parseInt(villageParam, 10) : undefined;

  useEffect(() => {
    fetchLocations({ status_filter: 'active' })
      .then((data) => setLocations(data))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-surface-dark p-5 rounded-3xl border border-emerald/20 shadow-sentinel-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-forest dark:text-pale-green tracking-tight flex items-center gap-2">
            <FilePlus2 className="w-5 h-5 text-emerald" />
            Frontline Syndromic Case Reporting Wizard
          </h2>
          <p className="text-xs text-forest/60 dark:text-pale-green/60 mt-0.5">
            Log water-borne illness observations. Works offline with automatic background sync.
          </p>
        </div>
      </div>

      <ReportWizard
        locations={locations}
        preselectedVillageId={preselectedId}
      />
    </div>
  );
};
