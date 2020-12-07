/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { queryCache } from 'react-query';
import { useTableData } from './useTableData';

const SYNDROMES = {
  AFR: 'Acute Fever and Rash (AFR)',
  DIA: 'Diarrhoea (DIA)',
  ILI: 'Influenza-like Illness (ILI)',
  PF: 'Prolonged Fever (PF)',
  DLI: 'Dengue-like Illness (DLI)',
};

const getAlerts = row =>
  Object.entries(row).reduce(
    (list, [key, value]) =>
      key.includes('Threshold Crossed') && value
        ? [...list, key.split('Threshold Crossed')[0]]
        : list,
    [],
  );

const getUnVerifiedAlerts = (alerts, verifiedStatuses) =>
  alerts.reduce(
    (list, syndrome) => (verifiedStatuses.includes(syndrome.id) ? list : [...list, syndrome.id]),
    [],
  );

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
});

const getEmptyTableData = () => Object.keys(SYNDROMES).map(getEmptySyndromeData);

const getTableData = data => Object.keys(SYNDROMES).map(id => getSyndromeData(id, data));

const toCommaList = values =>
  values
    .join(', ')
    .toUpperCase()
    .replace(/,(?!.*,)/gim, ' and');

export const useSingleWeeklyReport = (orgUnit, period, verifiedStatuses, pageQueryKey) => {
  const query = useTableData(
    `weeklyReport/${orgUnit}`,
    {
      params: { startWeek: period, endWeek: period },
    },
    {
      initialData: () => {
        const cachedQuery = queryCache.getQueryData([`weeklyReport/${orgUnit}`, pageQueryKey]);
        return cachedQuery?.data?.results.find(row => row.period === period);
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
      unVerifiedList: null,
    };
  }

  const data = query.data[0];
  const alerts = getAlerts(data);
  const unVerifiedAlerts = getUnVerifiedAlerts(alerts, verifiedStatuses);
  const syndromes = getTableData(data);

  return {
    ...query,
    data,
    syndromes,
    alerts,
    unVerifiedAlerts,
    unVerifiedList: toCommaList(unVerifiedAlerts),
  };
};
