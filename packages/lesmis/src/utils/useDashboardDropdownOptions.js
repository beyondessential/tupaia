import { useEntityData } from '../api';
import { DROPDOWN_OPTIONS, FAVOURITES_DASHBOARD_CODE, PROFILE_DASHBOARD_CODE } from '../constants';
import { useI18n } from './I18n';
import { useUrlParams } from './useUrlParams';
import { useUrlSearchParams } from './useUrlSearchParams';

export const useDashboardDropdownOptions = () => {
  const { entityCode } = useUrlParams();
  const { getProfileLabel, translate } = useI18n();
  const { data: entityData } = useEntityData(entityCode);
  const [params] = useUrlSearchParams();
  const selectedDashboard = params.dashboard;

  const getFilter = value => {
    switch (value) {
      case FAVOURITES_DASHBOARD_CODE:
        return ({ items }) => items.some(item => item.isFavourite);
      case PROFILE_DASHBOARD_CODE:
        // those not included anywhere else
        return ({ dashboardCode }) =>
          !DROPDOWN_OPTIONS.some(({ value: code }) => dashboardCode.startsWith(`LESMIS_${code}`));
      default:
        return ({ dashboardCode }) => dashboardCode.startsWith(`LESMIS_${value}`);
    }
  };

  const dropdownOptions = DROPDOWN_OPTIONS.map(config => {
    const { value, labelCode, componentPropConfig, ...restOfConfigs } = config;
    const label =
      value === PROFILE_DASHBOARD_CODE ? getProfileLabel(entityData?.type) : translate(labelCode);
    const filterSubDashboards = getFilter(value);
    const options = {
      value,
      label,
      componentProps: {
        filterSubDashboards,
        body: componentPropConfig?.body,
      },
      ...restOfConfigs,
    };
    return options;
  });

  const selectedOption =
    selectedDashboard && dropdownOptions.find(option => option.value === selectedDashboard);

  const [defaultProfileOption] = dropdownOptions;

  return {
    dropdownOptions,
    favouriteDropdownOption: dropdownOptions.find(
      ({ value }) => value === FAVOURITES_DASHBOARD_CODE,
    ),
    otherDropdownOptions: dropdownOptions.filter(
      ({ value }) => value !== FAVOURITES_DASHBOARD_CODE,
    ),
    selectedOption: selectedOption || defaultProfileOption,
  };
};
