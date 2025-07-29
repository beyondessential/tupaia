import { keyBy } from 'es-toolkit/compat';
import { combineQueries, getSyndromeData, useData, useReport } from './helpers';

export const useSitesSingleWeeklyReport = (countryCode, period, pageQueryKey) => {
  const query = combineQueries({
    report: useReport(
      `weeklyReport/${countryCode}/sites`,
      {
        params: { startWeek: period, endWeek: period },
      },
      pageQueryKey,
    ),
    sites: useData(`country/${countryCode}/sites`),
  });

  const { report, sites = [] } = query.data;
  const rowsByOrgUnit = keyBy(report, 'organisationUnit');
  const data = sites.map(site => {
    const { id, code, name, address, contact } = site;
    const row = rowsByOrgUnit[site.code] || {};

    return { id, code, name, address, contact, syndromes: getSyndromeData(row) };
  });

  return {
    ...query,
    data,
  };
};
