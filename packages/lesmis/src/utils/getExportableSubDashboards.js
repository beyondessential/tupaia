import { useMemo } from 'react';
import { useDashboardData } from '../api';
import { useDashboardDropdownOptions } from './useDashboardDropdownOptions';
import { useUrlParams } from './useUrlParams';

export const getExportableSubDashboards = dropdownOption => {
  const { entityCode } = useUrlParams();
  const { otherDropdownOptions } = useDashboardDropdownOptions();
  const isFavouriteDashboard = dropdownOption.value === 'favourites';

  const { data } = useDashboardData({
    entityCode,
    includeDrillDowns: false,
  });

  const isExportable = dropdownOption.exportToPDF;

  const exportableSubDashboards = useMemo(() => {
    if (!isExportable) {
      return [];
    }
    const { componentProps, useYearSelector } = dropdownOption;
    const { filterSubDashboards } = componentProps;
    const subDashboardsWithFavouriteDashboardItems = data?.filter(filterSubDashboards);

    if (!subDashboardsWithFavouriteDashboardItems) {
      return [];
    }

    if (isFavouriteDashboard) {
      // Add dropdown option label to favourite dashboard items
      return subDashboardsWithFavouriteDashboardItems
        .map(configs => {
          const index = otherDropdownOptions.findIndex(option => {
            const isBelongToThisDropdownOption =
              [configs].filter(option.componentProps.filterSubDashboards).length === 1;

            return isBelongToThisDropdownOption;
          });
          return {
            ...configs,
            dashboardLabel: otherDropdownOptions[index].label,
            sortOrder: index,
            useYearSelector,
          };
        })
        .sort((a, b) => a.sortOrder - b.sortOrder);
    }

    return subDashboardsWithFavouriteDashboardItems.map(configs => ({
      ...configs,
      dashboardLabel: dropdownOption.label,
      useYearSelector,
    }));
  }, [data, dropdownOption.value]);

  const totalPage = exportableSubDashboards?.reduce(
    (totalNum, { items }) => totalNum + Math.max(1, items.length),
    0,
  );

  return { exportableSubDashboards, totalPage };
};
