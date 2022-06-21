import { useMemo } from 'react';
import { useDashboardData } from '../api';
import { useUrlParams } from './useUrlParams';

export const getExportableDashboards = dropdownOptions => {
  const { entityCode } = useUrlParams();
  const { data } = useDashboardData({
    entityCode,
    includeDrillDowns: false,
  });
  const exportableDropDownOptions = dropdownOptions.filter(({ exportToPDF }) => exportToPDF);

  const exportableDashboards = useMemo(
    () =>
      exportableDropDownOptions
        .map(({ componentProps, label, useYearSelector }) => {
          const { filterSubDashboards } = componentProps;
          return data
            ?.filter(filterSubDashboards)
            .map(configs => ({ ...configs, dashboardLabel: label, useYearSelector }));
        })
        .flat()
        .filter(subDashboard => subDashboard),
    [data, JSON.stringify(exportableDropDownOptions)],
  );

  const totalPage = exportableDashboards?.reduce(
    (totalNum, { items }) => totalNum + Math.max(1, items.length),
    0,
  );

  return { exportableDashboards, totalPage };
};
