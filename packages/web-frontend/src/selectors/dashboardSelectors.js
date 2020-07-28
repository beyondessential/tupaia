import { createSelector } from 'reselect';

import { getUrlComponent, URL_COMPONENTS } from '../historyNavigation';

import { selectLocation } from './utils';

export const selectCurrentDashboardGroupCode = createSelector([selectLocation], location =>
  getUrlComponent(URL_COMPONENTS.DASHBOARD, location),
);

export const selectCurrentExpandedReportCode = createSelector([selectLocation], location =>
  getUrlComponent(URL_COMPONENTS.REPORT, location),
);

export const selectCurrentDashboardKey = createSelector(
  // TODO need to consolidate names here
  [state => state.global.dashboardConfig, selectCurrentDashboardGroupCode],
  (dashboardConfig, currentDashboardKey) =>
    dashboardConfig[currentDashboardKey] ? currentDashboardKey : Object.keys(dashboardConfig)[0],
);

export const selectDataForEnlargedDialog = createSelector(
  [
    selectCurrentExpandedReportCode, // TODO: consolidate this name
    state => state.enlargedDialog.viewContent,
    state => state.enlargedDialog.isLoading,
    state => state.enlargedDialog.startDate,
    state => state.enlargedDialog.endDate,
    state => state.dashboard.viewResponses,
  ],
  (expandedViewId, viewContent, isLoading, startDate, endDate, viewResponses) => {
    //return {};
    console.log({ expandedViewId, viewContent, isLoading, startDate, endDate, viewResponses });
    const correctViewContent =
      viewContent || Object.values(viewResponses).find(({ viewId }) => viewId === expandedViewId);
    return correctViewContent || null;
  },
);
