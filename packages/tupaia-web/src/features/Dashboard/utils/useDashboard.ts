// Utility hook to get the dashboard context

import { useContext } from 'react';
import { useParams } from 'react-router';
import { useGAEffect } from '../../../utils';
import { useDashboards } from '../../../api/queries';
import { Actions, DashboardContext, DashboardDispatchContext } from './DashboardContext';

// Contains the dashboards, active dashboard, and export and subscribe state
export const useDashboard = () => {
  const { dashboardName, entityCode, projectCode } = useParams();
  const { data: dashboards = [] } = useDashboards(projectCode, entityCode);
  const { selectedDashboardItems, exportModalOpen, subscribeModalOpen } =
    useContext(DashboardContext);
  const dispatch = useContext(DashboardDispatchContext);

  const setSelectedDashboardItems = (items: string[]) => {
    dispatch?.({ type: Actions.SET_SELECTED_DASHBOARD_ITEMS, payload: items });
  };

  const toggleExportModal = () => {
    dispatch?.({ type: Actions.TOGGLE_EXPORT_MODAL });
  };

  const toggleSubscribeModal = () => {
    dispatch?.({ type: Actions.TOGGLE_SUBSCRIBE_MODAL });
  };
  // trim dashboard name to avoid issues with trailing or leading spaces
  const activeDashboard =
    dashboards?.find(dashboard => dashboard.name.trim() === dashboardName?.trim()) ?? undefined;

  useGAEffect('Dashboard', 'Change Tab', activeDashboard?.name);

  return {
    activeDashboard,
    selectedDashboardItems,
    setSelectedDashboardItems,
    toggleExportModal,
    exportModalOpen,
    subscribeModalOpen,
    toggleSubscribeModal,
  };
};
