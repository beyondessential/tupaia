/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import keyBy from 'lodash.keyby';
import { combineQueries, useData, useReport } from './helpers';

export const useCountrySitesWeeklyReport = (countryCode, period) => {
  const query = combineQueries({
    report: useReport(`weeklyReport/${countryCode}/sites`, {
      params: { startWeek: period, endWeek: period },
    }),
    sites: useData(`country/${countryCode}/sites`),
  });

  const { report, sites = [] } = query.data;
  const rowsByOrgUnit = keyBy(report, 'organisationUnit');
  const data = sites.map(site => {
    const { code, name } = site;
    return { name, ...rowsByOrgUnit[code] };
  });

  return {
    ...query,
    data,
  };
};
