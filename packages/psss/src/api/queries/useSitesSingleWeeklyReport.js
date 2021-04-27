/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import keyBy from 'lodash.keyby';
import { combineQueries, getSyndromeData, useData, useReport } from './helpers';

export const useSitesSingleWeeklyReport = (countryCode, period, pageQueryKey) => {
  const { data: sites = [], ...siteQuery } = useData(`country/${countryCode}/sites`);
  const { data: report, ...reportQuery } = useReport(
    `weeklyReport/${countryCode}/sites`,
    {
      params: { startWeek: period, endWeek: period },
    },
    pageQueryKey,
  );

  const query = combineQueries([siteQuery, reportQuery]);
  const rowsByOrgUnit = keyBy(report, 'organisationUnit');
  const data = sites.map(site => {
    const { id, code, name, address, contact } = site;
    const row = rowsByOrgUnit[site.code] || {};

    return { id, code, name, address, contact, syndromes: getSyndromeData(row) };
  });

  return {
    ...query,
    reportCount: report.length,
    data,
  };
};
