import moment from 'moment';
import { createSelector } from 'reselect';
import { getUniqueViewId } from '../utils';

import {
  convertUrlPeriodStringToDateRange,
  getLocationComponentValue,
  URL_COMPONENTS,
} from '../historyNavigation';
import { getDefaultDates } from '../utils/periodGranularities';
import {
  selectCurrentOrgUnitCode,
  selectCountryHierarchy,
  selectAncestors,
  selectCurrentOrgUnit,
} from './orgUnitSelectors';
import { selectCurrentProject } from './projectSelectors';
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
    console.log('dashboards in selector', dashboards);
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

export const selectDashboardItemEditOptions = createSelector(
  [state => state.editOptions],
  editOptions => {
    return editOptions.dashboardItems;
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

export const selectCurrentBreadcrumbs = createSelector(
  [state => state, state => selectCurrentOrgUnit(state), state => selectCurrentProject(state)],
  (state, currentOrgUnit, currentProject) => {
    if (currentOrgUnit.type === 'Project') {
      return [];
    }

    const country = selectCountryHierarchy(state, currentOrgUnit.organisationUnitCode);
    const isProjectRegional = currentProject.names?.length > 1;
    const ancestors = selectAncestors(country, currentOrgUnit.organisationUnitCode, 'Country');
    if (!ancestors) {
      return [];
    }

    const ancestorsAscending = [];
    Object.keys(ancestors).forEach(ancestor => {
      const breadcrumbData = {
        code: ancestors[ancestor].organisationUnitCode,
        name: ancestors[ancestor].name,
      };
      ancestorsAscending.push(breadcrumbData);
    });
    if (isProjectRegional) {
      const projectBreadcrumbData = {
        code: currentProject.code,
        name: currentProject.name,
      };
      ancestorsAscending.push(projectBreadcrumbData);
    }

    const isOnlyRootEntity = ancestorsAscending.length === 1;
    if (isOnlyRootEntity) {
      return [];
    }

    const ancestorsDescending = ancestorsAscending.reverse();
    return ancestorsDescending;
  },
);
