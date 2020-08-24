import { createSelector } from 'reselect';

import { getLocationComponentValue, URL_COMPONENTS } from '../historyNavigation';
import { selectLocation } from './utils';

const selectCurrentDashboardKeyFromLocation = createSelector([selectLocation], location =>
  getLocationComponentValue(location, URL_COMPONENTS.DASHBOARD),
);

export const selectCurrentExpandedReportCode = state => state.enlargedDialog.viewId;

export const selectCurrentDashboardKey = createSelector(
  [state => state.global.dashboardConfig, selectCurrentDashboardKeyFromLocation],
  (dashboardConfig, currentDashboardKey) =>
    dashboardConfig[currentDashboardKey] ? currentDashboardKey : Object.keys(dashboardConfig)[0],
);

export const selectIsDashboardKeyDefined = createSelector(
  [selectCurrentDashboardKeyFromLocation],
  rawCurrentDashboardKey => !!rawCurrentDashboardKey,
);
