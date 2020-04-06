import createCachedSelector from 're-reselect';

// Attempt to use previously set tab name, revert to first tab if not available for this org unit.
export const getCurrentDashboardKey = ({ dashboard, global }) => {
  const { dashboardConfig } = global;
  const { currentDashboardKey } = dashboard;
  return dashboardConfig[currentDashboardKey]
    ? currentDashboardKey
    : Object.keys(dashboardConfig)[0];
};

export const cachedSelectMeasureBarItemById = createCachedSelector(
  [state => state.measureBar.measureHierarchy, (_, id) => id],
  (measureHierarchy, id) => {
    const flattenedMeasureHierarchy = [].concat(...Object.values(measureHierarchy));
    return flattenedMeasureHierarchy.find(measure => measure.measureId === id);
  },
)((state, id) => id);
