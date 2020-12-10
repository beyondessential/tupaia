/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { queryCache } from 'react-query';
import { useData } from './useData';

const SYNDROMES = {
  AFR: 'Acute Fever and Rash (AFR)',
  DIA: 'Diarrhoea (DIA)',
  ILI: 'Influenza-like Illness (ILI)',
  PF: 'Prolonged Fever (PF)',
  DLI: 'Dengue-like Illness (DLI)',
};

const getEmptySyndromeData = id => ({
  id,
  title: SYNDROMES[id],
  percentageChange: 0,
  totalCases: 0,
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

export const useSingleWeeklyReport = (orgUnit, period, verifiedStatuses, pageQueryKey) => {
  const query = useData(
    `weeklyReport/${orgUnit}`,
    {
      params: { startWeek: period, endWeek: period },
    },
    {
      initialData: () => {
        const cachedQuery = queryCache.getQueryData([`weeklyReport/${orgUnit}`, pageQueryKey]);
        const results = cachedQuery?.data?.results;

        if (!results) {
          return undefined;
        }

        if (results.length === 0) {
          return cachedQuery;
        }

        const record = results.filter(row => row.period === period);
        return record.length > 0
          ? { ...cachedQuery, data: { ...cachedQuery.data, results: record } }
          : undefined;
      },
    },
  );

  if (query.isLoading || query.data.length === 0) {
    return {
      ...query,
      data: {
        Sites: 0,
        'Sites Reported': 0,
      },
      syndromes: getEmptyTableData(),
      alerts: [],
      unVerifiedAlerts: [],
    };
  }

  const data = query.data[0];
  const alerts = getAlerts(data);

  const unVerifiedAlerts = alerts.filter(a => !verifiedStatuses.includes(a));
  const syndromes = getTableData(data);

  return {
    ...query,
    data,
    syndromes,
    alerts,
    unVerifiedAlerts,
  };
};
