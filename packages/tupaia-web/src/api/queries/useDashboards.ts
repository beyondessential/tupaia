/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { DashboardType } from '../../types';
// import { get } from '../api';

const testData = [
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

export const useDashboards = (projectCode?: string, entityCode?: string) => {
  return useQuery(
    ['dashboards', projectCode, entityCode],
    () => {
      return Promise.resolve(() => testData as DashboardType[]); // TODO: replace this with actual data fetching
    },
    // get('dashboards', {
    //   params: { entityCode, projectCode },
    // }),
    { enabled: !!entityCode && !!projectCode },
  );
};
