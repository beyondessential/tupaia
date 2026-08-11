import { groupBy } from 'es-toolkit/compat';
import { getSortByKey, reduceToDictionary } from '@tupaia/utils';
import { getPeriodByDate } from '../../utils';
import { combineQueries, useData, useReport } from './helpers';

export const useWeeklyReportForAlert = alert => {
  const { period, organisationUnit: countryCode, syndrome } = alert;

  const reportParams = {
    startWeek: period,
    endWeek: getPeriodByDate(new Date()),
    syndrome,
  };
  const query = combineQueries({
    countryReport: useReport(`confirmedWeeklyReport/${countryCode}`, {
      params: reportParams,
    }),
    siteReport: useReport(`weeklyReport/${countryCode}/sites`, {
      params: reportParams,
    }),
    sites: useData(`country/${countryCode}/sites`),
  });

  const { countryReport, siteReport, sites = [] } = query.data;
  const siteDataByWeek = groupBy(siteReport, 'period');
  const orgUnitCodeToName = reduceToDictionary(sites, 'code', 'name');

  const data = countryReport.sort(getSortByKey('period', { ascending: false })).map(countryData => {
    const siteData = (siteDataByWeek[countryData.period] ?? [])
      .map(site => ({
        ...site,
        name: orgUnitCodeToName[site.organisationUnit],
      }))
      .sort(getSortByKey('name'));

    return { ...countryData, sites: siteData };
  });

  return {
    ...query,
    data,
  };
};
