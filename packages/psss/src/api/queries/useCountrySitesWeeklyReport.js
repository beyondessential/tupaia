/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import keyBy from 'lodash.keyby';
import { combineQueries, useData, useReport } from './helpers';

export const useCountrySitesWeeklyReport = (countryCode, period) => {
  const { data: sites = [], ...siteQuery } = useData(`country/${countryCode}/sites`);
  const { data: report, ...reportQuery } = useReport(`weeklyReport/${countryCode}/sites`, {
    params: { startWeek: period, endWeek: period },
  });

  const query = combineQueries([siteQuery, reportQuery]);
  const rowsByOrgUnit = keyBy(report, 'organisationUnit');
  const data = sites.map(site => {
    const { code, name } = site;
    return { name, ...rowsByOrgUnit[code] };
  });

  return {
    ...query,
    reportCount: report.length,
    data,
  };
};
