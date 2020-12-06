/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { queryCache } from 'react-query';
import { useTableData } from './useTableData';

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

const getEmptyTableData = () => [
  { id: 'afr', title: 'Acute Fever and Rash (AFR)', percentageChange: 0, totalCases: 0 },
  { id: 'dia', title: 'Diarrhoea (DIA)', percentageChange: 0, totalCases: 0 },
  { id: 'ili', title: 'Influenza-like Illness (ILI)', percentageChange: 0, totalCases: 0 },
  { id: 'pf', title: 'Prolonged Fever (PF)', percentageChange: 0, totalCases: 0 },
  { id: 'dli', title: 'Dengue-like Illness (DLI)', percentageChange: 0, totalCases: 0 },
];

const toCommaList = values =>
  values
    .join(', ')
    .toUpperCase()
    .replace(/,(?!.*,)/gim, ' and');

const getTableData = data => [
  {
    id: 'afr',
    title: 'Acute Fever and Rash (AFR)',
    percentageChange: 0,
    totalCases: data.AFR,
    isAlert: data[`AFR Threshold Crossed`],
  },
  {
    id: 'dia',
    title: 'Diarrhoea (DIA)',
    percentageChange: 0,
    totalCases: data.DIA,
    isAlert: data[`DIA Threshold Crossed`],
  },
  {
    id: 'ili',
    title: 'Influenza-like Illness (ILI)',
    percentageChange: 0,
    totalCases: data.ILI,
    isAlert: data[`ILI Threshold Crossed`],
  },
  {
    id: 'pf',
    title: 'Prolonged Fever (PF)',
    percentageChange: 0,
    totalCases: data.PF,
    isAlert: data[`PF Threshold Crossed`],
  },
  {
    id: 'dli',
    title: 'Dengue-like Illness (DLI)',
    percentageChange: 0,
    totalCases: data.DLI,
    isAlert: data[`DLI Threshold Crossed`],
  },
];

export const useSingleWeeklyReport = (orgUnit, period, verifiedStatuses, pageQueryKey) => {
  const query = useTableData(
    `weeklyReport/${orgUnit}`,
    {
      params: { startWeek: period, endWeek: period },
    },
    {
      initialData: () => {
        const data = queryCache.getQueryData([`weeklyReport/${orgUnit}`, pageQueryKey]);
        // Todo: get correct endpoint for weekly reports panel and see if it is possible to set initial data
        return undefined;
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
