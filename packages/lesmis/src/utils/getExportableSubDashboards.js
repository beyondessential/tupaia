import { useMemo } from 'react';
import { useDashboardData } from '../api';
import { useUrlParams } from './useUrlParams';

export const getExportableSubDashboards = dropdownOption => {
  const { entityCode } = useUrlParams();
  const { data } = useDashboardData({
    entityCode,
    includeDrillDowns: false,
  });

  if (dropdownOption.exportToPDF === undefined || !dropdownOption.exportToPDF) {
    const totalPage = 0;
    return { totalPage };
  }

  const exportableSubDashboards = useMemo(() => {
    const { componentProps, label, useYearSelector } = dropdownOption;
    const { filterSubDashboards } = componentProps;
    return data
      ?.filter(filterSubDashboards)
      .map(configs => ({ ...configs, dashboardLabel: label, useYearSelector }));
  }, [data, JSON.stringify(dropdownOption)]);

  const totalPage = exportableSubDashboards?.reduce(
    (totalNum, { items }) => totalNum + Math.max(1, items.length),
    0,
  );

  return { exportableSubDashboards, totalPage };
};
