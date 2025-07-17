// Utility hook to get the dashboard context

import { useContext } from 'react';
import { useParams } from 'react-router';
import { useGAEffect } from '../../../utils';
import { useDashboards } from '../../../api/queries';
import { DashboardContext } from './DashboardContext';

// Contains the dashboards, active dashboard, and export and subscribe state
export const useDashboard = () => {
  const { dashboardName, entityCode, projectCode } = useParams();
  const { data: dashboards = [] } = useDashboards(projectCode, entityCode);
  const { exportModalOpen, subscribeModalOpen, setExportModalOpen, setSubscribeModalOpen } =
    useContext(DashboardContext);

  const toggleExportModal = () => {
    setExportModalOpen(!exportModalOpen);
  };

  const toggleSubscribeModal = () => {
    setSubscribeModalOpen(!subscribeModalOpen);
  };
  // trim dashboard name to avoid issues with trailing or leading spaces
  const activeDashboard = dashboards?.find(
    dashboard => dashboard.name.trim() === dashboardName?.trim(),
  );

  useGAEffect('Dashboard', 'Change Tab', activeDashboard?.name);

  return {
    activeDashboard,
    toggleExportModal,
    exportModalOpen,
    subscribeModalOpen,
    toggleSubscribeModal,
  };
};
