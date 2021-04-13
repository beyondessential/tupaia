/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getWeekNumberByPeriod, getCurrentPeriod } from '../../utils';
import { useData } from './useData';

export const useConfirmedCountries = countryCodes => {
  const period = getCurrentPeriod();
  const currentWeekNumber = getWeekNumberByPeriod(period);

  const params = { startWeek: period, orgUnitCodes: countryCodes.join(',') };
  const query = useData('confirmedWeeklyReport', { params });
  const sites = countryCodes.length;
  const sitesReported = query?.data.length;

  return {
    ...query,
    currentWeekNumber,
    sites,
    sitesReported,
  };
};
