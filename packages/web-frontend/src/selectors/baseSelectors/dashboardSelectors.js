import { createSelector } from 'reselect';
import { selectCurrentDashboardGroupCode } from './urlSelectors';

export const selectCurrentDashboardKey = createSelector(
  // TODO need to consolidate names here
  [state => state.global.dashboardConfig, selectCurrentDashboardGroupCode],
  (dashboardConfig, currentDashboardKey) =>
    dashboardConfig[currentDashboardKey] ? currentDashboardKey : Object.keys(dashboardConfig)[0],
);
