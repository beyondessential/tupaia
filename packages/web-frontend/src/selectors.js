// Attempt to use previously set tab name, revert to first tab if not available for this org unit.
export const getCurrentDashboardKey = ({ dashboard, global }) => {
  const { dashboardConfig } = global;
  const { currentDashboardKey } = dashboard;
  return dashboardConfig[currentDashboardKey]
    ? currentDashboardKey
    : Object.keys(dashboardConfig)[0];
};
