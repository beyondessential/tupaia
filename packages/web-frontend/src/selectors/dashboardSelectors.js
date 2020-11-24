import moment from 'moment';
import { createSelector } from 'reselect';
import { getUniqueViewId } from '../utils';

import {
  convertUrlPeriodStringToDateRange,
  getLocationComponentValue,
  URL_COMPONENTS,
} from '../historyNavigation';
import { getDefaultDates } from '../utils/periodGranularities';
import { selectCurrentOrgUnitCode } from './orgUnitSelectors';
import { selectLocation } from './utils';

export const selectCurrentDashboardGroupCodeFromLocation = createSelector(
  [selectLocation],
  location => getLocationComponentValue(location, URL_COMPONENTS.DASHBOARD),
);

export const selectCurrentExpandedViewId = createSelector([selectLocation], location =>
  getLocationComponentValue(location, URL_COMPONENTS.REPORT),
);

export const selectCurrentExpandedDates = createSelector([selectLocation], location => {
  const startDateString = getLocationComponentValue(location, URL_COMPONENTS.REPORT_PERIOD) ?? '';
  return convertUrlPeriodStringToDateRange(startDateString);
});

export const selectCurrentDashboardGroupCode = createSelector(
  [state => state.global.dashboardConfig, selectCurrentDashboardGroupCodeFromLocation],
  (dashboardConfig, currentDashboardGroupCode) =>
    dashboardConfig[currentDashboardGroupCode]
      ? currentDashboardGroupCode
      : Object.keys(dashboardConfig)[0],
);

const selectCurrentDashboardGroupIdForExpandedReport = createSelector(
  [
    state => state.global.dashboardConfig,
    selectCurrentDashboardGroupCode,
    selectCurrentExpandedViewId,
  ],
  (dashboardConfig, currentDashboardGroupCode, currentViewId) => {
    const dashboardGroup = dashboardConfig[currentDashboardGroupCode];
    if (!dashboardGroup) return null;
    const dashboardGroupIncludingReport = Object.values(dashboardGroup).find(({ views }) =>
      views.some(({ viewId }) => viewId === currentViewId),
    );
    return dashboardGroupIncludingReport ? dashboardGroupIncludingReport.dashboardGroupId : null;
  },
);

export const selectIsDashboardGroupCodeDefined = createSelector(
  [selectCurrentDashboardGroupCodeFromLocation],
  rawCurrentDashboardGroupCode => !!rawCurrentDashboardGroupCode,
);

export const selectCurrentInfoViewKey = createSelector(
  [
    selectCurrentDashboardGroupIdForExpandedReport,
    selectCurrentOrgUnitCode,
    selectCurrentExpandedViewId,
  ],
  (dashboardGroupId, organisationUnitCode, viewId) =>
    getUniqueViewId({
      organisationUnitCode,
      dashboardGroupId,
      viewId,
    }),
);

export const selectCurrentExpandedViewContent = createSelector(
  [selectCurrentInfoViewKey, state => state.dashboard.viewResponses],
  (infoViewKey, viewResponses) => {
    return viewResponses[infoViewKey];
  },
);

export const selectIsEnlargedDialogVisible = createSelector(
  [
    selectCurrentDashboardGroupIdForExpandedReport,
    selectCurrentOrgUnitCode,
    selectCurrentExpandedViewId,
  ],
  (dashboardGroupId, organisationUnitCode, viewId) =>
    !!(dashboardGroupId && organisationUnitCode && viewId),
);

export const selectShouldUseDashboardData = createSelector(
  [selectCurrentInfoViewKey, selectCurrentExpandedViewContent, (_, options) => options],
  (candidateInfoViewKey, candidateViewContent, options) => {
    const { startDate, endDate, infoViewKey, drillDownLevel } = options;

    if (drillDownLevel > 0) return false;
    if (candidateInfoViewKey !== infoViewKey) return false;
    if (!candidateViewContent || candidateViewContent.type === 'matrix') return false;

    const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDates(
      candidateViewContent,
    );
    const {
      startDate: candidateStartDate = defaultStartDate,
      endDate: candidateEndDate = defaultEndDate,
    } = candidateViewContent;

    if (!startDate && !endDate) return true;
    if (!moment(candidateStartDate).isSame(moment(startDate), 'day')) return false;
    if (!moment(candidateEndDate).isSame(moment(endDate), 'day')) return false;

    return true;
  },
);
