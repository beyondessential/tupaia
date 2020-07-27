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
