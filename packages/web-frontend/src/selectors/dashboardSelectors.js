import { createSelector } from 'reselect';

export const selectCurrentExpandedReportCode = state => state.enlargedDialog.viewId;

export const selectCurrentDashboardKey = createSelector(
  [state => state.global.dashboardConfig, state => state.dashboard.currentDashboardKey],
  (dashboardConfig, currentDashboardKey) =>
    dashboardConfig[currentDashboardKey] ? currentDashboardKey : Object.keys(dashboardConfig)[0],
);
