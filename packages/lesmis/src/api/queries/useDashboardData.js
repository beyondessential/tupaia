/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useQuery } from 'react-query';
import { get } from '../api';
import { QUERY_OPTIONS } from './constants';

const getDrillDownCodes = dashboardItems =>
  dashboardItems
    .filter(d => !!d.drillDown)
    .reduce((codes, d) => {
      const entry = d.drillDown?.itemCodeByEntry;

      if (entry) {
        const values = Object.values(d.drillDown.itemCodeByEntry);
        return [...codes, ...values];
      }
      return codes;
    }, []);

export const useDashboardData = ({ entityCode, includeDrillDowns = true }) => {
  const query = useQuery(
    ['dashboard', entityCode],
    () => get(`dashboard/${entityCode}`),
    QUERY_OPTIONS,
  );

  const data = query.data?.map(dashboard => {
    const drillDownItemCodes = getDrillDownCodes(dashboard.items);

    let dashboardItems = dashboard.items.filter(({ type }) => type === 'chart' || type === 'list'); // Only show supported chart types

    if (!includeDrillDowns) {
      // Remove the drill downs from the main dashboard items list
      dashboardItems = dashboardItems.filter(view => !drillDownItemCodes.includes(view.code));
    }

    return { ...dashboard, items: dashboardItems };
  });

  return { ...query, data };
};
