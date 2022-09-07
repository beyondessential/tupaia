import { useMemo } from 'react';
import { useDashboardData } from '../api';
import { useUrlParams } from './useUrlParams';

export const getExportableSubDashboards = dropdownOption => {
  const { entityCode } = useUrlParams();
  // const hasFavouriteItemsOnly = dropdownOption.value === 'favourites';

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
    return data
      ?.filter(filterSubDashboards)
      .map(configs => ({ ...configs, dashboardLabel: configs.dashboardName, useYearSelector }));
  }, [data, dropdownOption.value]);

  const totalPage = exportableSubDashboards?.reduce(
    (totalNum, { items }) => totalNum + Math.max(1, items.length),
    0,
  );

  return { exportableSubDashboards, totalPage };
};
