import { createSelector } from 'reselect';

import { getLocationComponentValue, URL_COMPONENTS } from '../historyNavigation';
import { getUniqueViewId } from '../utils';
import { selectLocation } from './utils';
import { selectCurrentOrgUnitCode } from './orgUnitSelectors';

const selectCurrentDashboardGroupCodeFromLocation = createSelector([selectLocation], location =>
  getLocationComponentValue(location, URL_COMPONENTS.DASHBOARD),
);

export const selectCurrentExpandedViewId = createSelector([selectLocation], location =>
  getLocationComponentValue(location, URL_COMPONENTS.REPORT),
);

export const selectCurrentDashboardGroupCode = createSelector(
  [state => state.global.dashboardConfig, selectCurrentDashboardGroupCodeFromLocation],
  (dashboardConfig, currentDashboardGroupCode) =>
    dashboardConfig[currentDashboardGroupCode]
      ? currentDashboardGroupCode
      : Object.keys(dashboardConfig)[0],
);

export const selectCurrentDashboardGroupId = createSelector(
  [state => state.global.dashboardConfig, selectCurrentDashboardGroupCode],
  (dashboardConfig, currentDashboardGroupCode) => {
    const dashboardGroup = dashboardConfig[currentDashboardGroupCode];
    if (!dashboardGroup) return null;
    return Object.values(dashboardGroup)[0].dashboardGroupId;
  },
);

export const selectIsDashboardGroupCodeDefined = createSelector(
  [selectCurrentDashboardGroupCodeFromLocation],
  rawCurrentDashboardGroupCode => !!rawCurrentDashboardGroupCode,
);

export const selectCurrentInfoViewKey = createSelector(
  [selectCurrentDashboardGroupId, selectCurrentOrgUnitCode, selectCurrentExpandedViewId],
  (dashboardGroupId, organisationUnitCode, viewId) =>
    getUniqueViewId({
      organisationUnitCode,
      dashboardGroupId,
      viewId,
    }),
);

export const selectCurrentExpandedViewContent = createSelector(
  [
    state => state.enlargedDialog.viewContent,
    selectCurrentInfoViewKey,
    state => state.dashboard.viewResponses,
  ],
  (viewContent, infoViewKey, viewResponses) => {
    return viewContent || viewResponses[infoViewKey];
  },
);
