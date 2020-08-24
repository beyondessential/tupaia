import { createSelector } from 'reselect';

import { getLocationComponentValue, URL_COMPONENTS } from '../historyNavigation';
import { selectLocation } from './utils';
import { selectCurrentOrgUnit } from './orgUnitSelectors';

const selectCurrentDashboardGroupCodeFromLocation = createSelector([selectLocation], location =>
  getLocationComponentValue(location, URL_COMPONENTS.DASHBOARD),
);

export const selectCurrentExpandedReportCode = createSelector([selectLocation], location =>
  getLocationComponentValue(location, URL_COMPONENTS.REPORT),
);

export const selectCurrentDashboardGroupCode = createSelector(
  [state => state.global.dashboardConfig, selectCurrentDashboardGroupCodeFromLocation],
  (dashboardConfig, currentDashboardGroupCode) =>
    dashboardConfig[currentDashboardGroupCode]
      ? currentDashboardGroupCode
      : Object.keys(dashboardConfig)[0],
);

export const selectIsDashboardGroupCodeDefined = createSelector(
  [selectCurrentDashboardGroupCodeFromLocation],
  rawCurrentDashboardGroupCode => !!rawCurrentDashboardGroupCode,
);

export const selectCurrentExpandedViewContent = createSelector(
  [
    selectCurrentDashboardGroupCode,
    selectCurrentOrgUnit,
    selectCurrentExpandedReportCode,
    state => state.dashboard.viewResponses,
  ],
  (dashboardGroupCode, orgUnit, infoViewKey, viewResponses) => viewResponses[infoViewKey],
);
