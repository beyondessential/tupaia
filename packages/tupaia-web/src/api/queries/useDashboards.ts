/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { DashboardType } from '../../types';
// import { get } from '../api';

const exploreData = [
  {
    id: 'test',
    code: 'explore_General',
    name: 'General',
    rootEntityCode: 'explore',
    sortOrder: null,
    items: [
      {
        code: '28',
        legacy: true,
        reportCode: '28',
        name: 'Number of Operational Facilities Surveyed by Country',
        type: 'chart',
        chartType: 'pie',
        valueType: 'text',
        isFavourite: null,
        rootEntityCode: 'DL',
        id: '28',
        viewType: '',
        periodGranularity: null,
      },
      {
        code: '8',
        legacy: true,
        reportCode: '8',
        name: 'Number of Healthcare Workers',
        type: 'chart',
        chartType: 'pie',
        valueType: 'text',
        defaultTimePeriod: {
          start: {
            unit: 'year',
            offset: -1,
          },
        },
      },
    ],
  },
];
const unfpaData = [
  {
    name: 'UNFPA',
    id: 'test2',
    code: 'FJ_UNFPA',
    rootEntityCode: 'unfpa',
    sortOrder: null,
    items: [
      {
        code: 'rh_n_stock_card_use_at_facilities',
        legacy: false,
        reportCode: 'rh_n_stock_card_use_at_facilities',
        name: 'Stock Card Use at Facilities (Yearly survey data)',
        type: 'chart',
        chartType: 'bar',
        labelType: 'fractionAndPercentage',
        valueType: 'percentage',
        chartConfig: {
          'Stock card available': {
            color: 'green',
          },
          'Stock card up to date': {
            color: 'orange',
          },
        },
        description:
          'Facilities that have at least 1 stock card available for managed RH commodities. Of the stock cards available, facilities where at least 1 stock card is up to date.',
        periodGranularity: 'year',
        isFavourite: false,
      },
    ],
  },
];

export const useDashboards = (projectCode?: string, entityCode?: string) => {
  return useQuery(
    ['dashboards', projectCode, entityCode],
    () => {
      // @ts-ignore - just for testData
      let testData = [];
      if (projectCode === 'explore') testData = exploreData;
      else if (projectCode === 'unfpa') testData = unfpaData;
      // @ts-ignore - just for testData
      return Promise.resolve(() => testData as DashboardType[]); // TODO: replace this with actual data fetching
    },
    // get('dashboards', {
    //   params: { entityCode, projectCode },
    // }),
    { enabled: !!entityCode && !!projectCode },
  );
};
