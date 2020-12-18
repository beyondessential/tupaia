/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getWeekNumberByPeriod, getCurrentPeriod } from '../../utils';
import { useData } from './useData';

export const useConfirmedCountries = countryCodes => {
  const period = getCurrentPeriod();
  const currentWeekNumber = getWeekNumberByPeriod(period);

  const query = useData('confirmedWeeklyReport', { params: { startWeek: period } });
  const sites = countryCodes.length;
  const sitesReported = query?.data.length;

  return {
    ...query,
    currentWeekNumber,
    sites,
    sitesReported,
  };
};
