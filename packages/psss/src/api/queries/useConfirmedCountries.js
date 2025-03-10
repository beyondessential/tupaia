import { getWeekNumberByPeriod, getCurrentPeriod } from '../../utils';
import { useReport } from './helpers';

export const useConfirmedCountries = countryCodes => {
  const period = getCurrentPeriod();
  const currentWeekNumber = getWeekNumberByPeriod(period);

  const params = { startWeek: period, endWeek: period, orgUnitCodes: countryCodes.join(',') };
  const query = useReport('confirmedWeeklyReport', { params });
  const sites = countryCodes.length;
  const sitesReported = query?.data.length;

  return {
    ...query,
    currentWeekNumber,
    sites,
    sitesReported,
  };
};
