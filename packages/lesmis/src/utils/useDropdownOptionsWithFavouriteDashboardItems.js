import { useDashboardData } from '../api';
import { useDashboardDropdownOptions } from './useDashboardDropdownOptions';
import { useUrlParams } from './useUrlParams';

const getDropdownOptionsWithFavouriteDashboardItems = (data = []) => {
  const { favouriteDropdownOption, otherDropdownOptions } = useDashboardDropdownOptions();
  const subDashboardsWithFavouriteDashboardItems = data.filter(
    favouriteDropdownOption.componentProps.filterSubDashboards,
  );

  const filteredDropdownOptions = otherDropdownOptions.map(dropdownOption => {
    const { filterSubDashboards } = dropdownOption.componentProps;
    const subDashboards = subDashboardsWithFavouriteDashboardItems.filter(filterSubDashboards);

    return { ...dropdownOption, subDashboards };
  });

  return filteredDropdownOptions.filter(dropdownOption => dropdownOption.subDashboards.length > 0);
};

export const useDropdownOptionsWithFavouriteDashboardItems = () => {
  const { entityCode } = useUrlParams();
  const { data, isLoading, isError, error } = useDashboardData({
    entityCode,
    includeDrillDowns: false,
  });

  const dropdownOptionsWithFavouriteDashboardItems = getDropdownOptionsWithFavouriteDashboardItems(
    data,
  );
  return { dropdownOptionsWithFavouriteDashboardItems, isLoading, isError, error };
};
