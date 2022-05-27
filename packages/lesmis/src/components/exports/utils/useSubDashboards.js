import { useMemo } from 'react';
import { useDashboardDropdownOptions } from '../../../utils/useDashboardDropdownOptions';
import { useUrlParams } from '../../../utils';
import { useDashboardData } from '../../../api';

export const useSubDashboards = () => {
  const { entityCode } = useUrlParams();
  const { dropdownOptions } = useDashboardDropdownOptions();
  const profileDropDownOptions = dropdownOptions.find(({ value }) => value === 'profile');
  const { filterSubDashboards } = profileDropDownOptions.componentProps;
  const { data } = useDashboardData({
    entityCode,
    includeDrillDowns: false,
  });
  const subDashboards = useMemo(() => data?.filter(filterSubDashboards), [
    data,
    filterSubDashboards,
  ]);

  return subDashboards;
};
