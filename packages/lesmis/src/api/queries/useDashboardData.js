/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useQuery } from 'react-query';
import { get } from '../api';

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
  const query = useQuery(['dashboard', entityCode], () => get(`dashboard/${entityCode}`), {
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const data = query.data?.map(dashboard => {
    const drillDownItemCodes = getDrillDownCodes(dashboard.items);

    let dashboardItems = dashboard.items.filter(({ type }) => type === 'chart' || type === 'list'); // Only show supported chart types

    if (!includeDrillDowns) {
      // Remove the drill downs from the main dashboard items list
      dashboardItems = dashboardItems.filter(view => !drillDownItemCodes.includes(view.code));
    }

    // Save the drill down configs so they can be used to display the nested reports
    const drillDowns = dashboard.items.filter(view => drillDownItemCodes.includes(view.code));

    return { ...dashboard, items: dashboardItems, drillDowns };
  });

  return { ...query, data };
};
