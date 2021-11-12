/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { useI18n } from '../components/I18n';

export const useProfileLabel = () => {
  const { translate } = useI18n();

  const getProfileLabel = entityType => {
    if (!entityType) {
      return 'Profile';
    }
    switch (entityType) {
      case 'country':
        return translate('dashboards.countryProfile');
      case 'district':
        return translate('dashboards.provinceProfile');
      case 'sub_district':
        return translate('dashboards.districtProfile');
      case 'school':
        return translate('dashboards.schoolProfile');
      default:
        return `${entityType} Profile`;
    }
  };

  return { getProfileLabel };
};
