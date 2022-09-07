/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { useEntityData } from '../api';
import { SUB_DASHBOARD_OPTIONS } from '../constants';
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
      case 'favourites':
        return ({ items }) => items.some(item => item.isFavourite);
      case 'profile':
        // those not included anywhere else
        return ({ dashboardCode }) =>
          !SUB_DASHBOARD_OPTIONS.some(({ value: code }) =>
            dashboardCode.startsWith(`LESMIS_${code}`),
          );
      default:
        return ({ dashboardCode }) => dashboardCode.startsWith(`LESMIS_${value}`);
    }
  };

  const dropdownOptions = SUB_DASHBOARD_OPTIONS.map(config => {
    const { value, labelCode, componentPropConfig, ...restOfConfigs } = config;
    const label = value === 'profile' ? getProfileLabel(entityData?.type) : translate(labelCode);
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
    favouriteDropdownOption: dropdownOptions.find(({ value }) => value === 'favourites'),
    otherDropdownOptions: dropdownOptions.filter(({ value }) => value !== 'favourites'),
    selectedOption: selectedOption || defaultProfileOption,
  };
};
