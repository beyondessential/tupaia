/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { queryCache } from 'react-query';
import { useData } from './useData';
import { calculateWeekStatus } from '../../utils';
import { REPORT_STATUSES, SYNDROMES } from '../../constants';

const getEmptySyndromeData = id => ({
  id,
  title: SYNDROMES[id],
  percentageChange: undefined,
  totalCases: null,
});

const getSyndromeData = (id, data) => ({
  ...getEmptySyndromeData(id),
  totalCases: data[id],
  isAlert: data[`${id} Threshold Crossed`],
  percentageChange: data[`${id} WoW Increase`],
});

/**
 *
 * @returns {{id: *, title: *, percentageChange: number, totalCases: number}[]}
 */
const getEmptyTableData = () => Object.keys(SYNDROMES).map(getEmptySyndromeData);

/**
 *
 * @param data
 * @returns {{id: *, title: *, percentageChange: number, totalCases: number,isAlert: *}[]}
 */
const getTableData = data => Object.keys(SYNDROMES).map(id => getSyndromeData(id, data));

/**
 *
 * @param row
 * @returns [] eg. ['AFR', 'PF']
 */
const getAlerts = row =>
  Object.entries(row).reduce(
    (list, [key, value]) =>
      key.includes('Threshold Crossed') && value
        ? [...list, key.split(' Threshold Crossed')[0]]
        : list,
    [],
  );

const useCachedQuery = (endpoint, orgUnit, period, queryKey) => {
  return useData(
    `${endpoint}/${orgUnit}`,
    {
      params: { startWeek: period, endWeek: period },
    },
    {
      initialData: () => {
        const cachedQuery = queryCache.getQueryData([`${endpoint}/${orgUnit}`, queryKey]);
        const results = cachedQuery?.data?.results;

        if (!results) {
          return undefined;
        }

        if (results.length === 0) {
          return cachedQuery;
        }

        const record = results.filter(row => row.period === period);

        // If there is no results in the cache,
        // don't try to populate the query with initial data
        if (record.length === 0) {
          return undefined;
        }

        return { ...cachedQuery, data: { ...cachedQuery.data, results: record } };
      },
    },
  );
};

export const useSingleWeeklyReport = (orgUnit, period, verifiedStatuses, pageQueryKey) => {
  const reportQuery = useCachedQuery('weeklyReport', orgUnit, period, pageQueryKey);
  const confirmedReportQuery = useCachedQuery(
    'confirmedWeeklyReport',
    orgUnit,
    period,
    pageQueryKey,
  );

  if (reportQuery.isLoading || confirmedReportQuery.isLoading || reportQuery.data.length === 0) {
    return {
      ...reportQuery,
      data: {
        Sites: 0,
        'Sites Reported': 0,
      },
      syndromes: getEmptyTableData(),
      alerts: [],
      unVerifiedAlerts: [],
      reportStatus: REPORT_STATUSES.OVERDUE,
    };
  }

  const [report] = reportQuery.data;
  const [confirmedReport] = confirmedReportQuery?.data;
  const alerts = getAlerts(report);
  const unVerifiedAlerts = alerts.filter(a => !verifiedStatuses.includes(a));

  return {
    ...reportQuery,
    data: report,
    reportStatus: calculateWeekStatus(report, confirmedReport),
    syndromes: getTableData(report),
    alerts,
    unVerifiedAlerts,
  };
};
