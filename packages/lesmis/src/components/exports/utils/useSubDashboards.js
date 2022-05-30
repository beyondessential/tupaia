import { useMemo } from 'react';
import { useDashboardDropdownOptions } from '../../../utils/useDashboardDropdownOptions';
import { useUrlParams } from '../../../utils';
import { useDashboardData } from '../../../api';

export const useSubDashboards = () => {
  const { entityCode } = useUrlParams();
  const { dropdownOptions } = useDashboardDropdownOptions();
  const profileDropDownOptions = dropdownOptions.filter(({ exportToPDF }) => exportToPDF);
  const { data } = useDashboardData({
    entityCode,
    includeDrillDowns: false,
  });

  const subDashboards = useMemo(
    () =>
      profileDropDownOptions
        .map(({ componentProps, label, useYearSelector }) => {
          const { filterSubDashboards } = componentProps;
          return data
            ?.filter(filterSubDashboards)
            .map(configs => ({ ...configs, dashboardLabel: label, useYearSelector }));
        })
        .flat()
        .filter(subDashboard => subDashboard),
    [data, JSON.stringify(profileDropDownOptions)],
  );

  return subDashboards;
};
