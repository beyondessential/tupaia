/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import groupBy from 'lodash.groupby';
import keyBy from 'lodash.keyby';
import { reduceToDictionary } from '@tupaia/utils';
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
  const countryDataByWeek = keyBy(countryReport, 'period');
  const siteDataByWeek = groupBy(siteReport, 'period');
  const orgUnitCodeToName = reduceToDictionary(sites, 'code', 'name');

  const data = Object.values(countryDataByWeek).map(countryData => {
    const siteData = (siteDataByWeek[countryData.period] ?? []).map(site => ({
      ...site,
      name: orgUnitCodeToName[site.organisationUnit],
    }));

    return { ...countryData, sites: siteData };
  });

  return {
    ...query,
    data,
  };
};
