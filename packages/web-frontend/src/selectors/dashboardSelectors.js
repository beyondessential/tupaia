import moment from 'moment';
import { createSelector } from 'reselect';
import { getUniqueViewId } from '../utils';

import {
  convertUrlPeriodStringToDateRange,
  getLocationComponentValue,
  URL_COMPONENTS,
} from '../historyNavigation';
import { getDefaultDatePickerDates } from '../utils/periodGranularities';
import { selectCurrentOrgUnitCode } from './orgUnitSelectors';
import { selectLocation } from './utils';

export const selectCurrentDashboardNameFromLocation = createSelector([selectLocation], location => {
  const dashboardSegment = getLocationComponentValue(location, URL_COMPONENTS.DASHBOARD);
  return dashboardSegment && decodeURIComponent(dashboardSegment);
});

export const selectCurrentExpandedViewCode = createSelector([selectLocation], location =>
  getLocationComponentValue(location, URL_COMPONENTS.REPORT),
);

export const selectViewConfig = createSelector(
  [state => state.global.viewConfigs, (_, uniqueViewId) => uniqueViewId],
  (viewConfigs, uniqueViewId) => viewConfigs[uniqueViewId] || {},
);

export const selectCurrentExpandedDates = createSelector([selectLocation], location => {
  const periodString = getLocationComponentValue(location, URL_COMPONENTS.REPORT_PERIOD) ?? '';
  return convertUrlPeriodStringToDateRange(periodString);
});

export const selectCurrentDashboardName = createSelector(
  [state => state.global.dashboards, selectCurrentDashboardNameFromLocation],
  (dashboards, currentDashboardName) => {
    if (dashboards.find(d => d.dashboardName === currentDashboardName)) {
      return currentDashboardName;
    }
    return dashboards[0] ? dashboards[0].dashboardName : '';
  },
);

export const selectCurrentDashboardCodeForExpandedReport = createSelector(
  [state => state.global.dashboards, selectCurrentDashboardName, selectCurrentExpandedViewCode],
  (dashboards, currentDashboardName, currentDashboardItemCode) => {
    const dashboardIncludingReport = dashboards.find(
      d =>
        d.dashboardName === currentDashboardName &&
        d.items.some(({ code }) => code === currentDashboardItemCode),
    );
    return dashboardIncludingReport ? dashboardIncludingReport.dashboardCode : null;
  },
);

export const selectCurrentInfoViewKey = createSelector(
  [
    selectCurrentDashboardCodeForExpandedReport,
    selectCurrentOrgUnitCode,
    selectCurrentExpandedViewCode,
  ],
  (dashboardCode, organisationUnitCode, viewCode) =>
    getUniqueViewId(organisationUnitCode, dashboardCode, viewCode),
);

export const selectCurrentExpandedViewConfig = createSelector(
  [selectCurrentInfoViewKey, state => state.global.viewConfigs],
  (infoViewKey, viewConfigs) => viewConfigs[infoViewKey],
);

export const selectCurrentExpandedViewContent = createSelector(
  [selectCurrentInfoViewKey, state => state.dashboard.viewResponses],
  (infoViewKey, viewResponses) => {
    return viewResponses[infoViewKey];
  },
);

export const selectIsEnlargedDialogVisible = createSelector(
  [
    selectCurrentDashboardCodeForExpandedReport,
    selectCurrentOrgUnitCode,
    selectCurrentExpandedViewCode,
  ],
  (dashboardCode, organisationUnitCode, viewCode) =>
    !!(dashboardCode && organisationUnitCode && viewCode),
);

export const selectShouldUseDashboardData = createSelector(
  [selectCurrentInfoViewKey, selectCurrentExpandedViewConfig, (_, options) => options],
  (candidateInfoViewKey, candidateViewConfig, options) => {
    const { startDate, endDate, infoViewKey, drillDownLevel } = options;

    if (drillDownLevel > 0) return false;
    if (candidateInfoViewKey !== infoViewKey) return false;
    if (!candidateViewConfig || candidateViewConfig.type === 'matrix') return false;

    const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDatePickerDates(
      candidateViewConfig,
    );

    if (!startDate && !endDate) return true;
    if (!moment(defaultStartDate).isSame(moment(startDate), 'day')) return false;
    if (!moment(defaultEndDate).isSame(moment(endDate), 'day')) return false;

    return true;
  },
);
