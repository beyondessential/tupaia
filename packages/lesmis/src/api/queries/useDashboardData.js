/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useQuery } from 'react-query';
import { get } from '../api';

export const useDashboardData = entityCode => {
  const query = useQuery(['dashboard', entityCode], () => get(`dashboard/${entityCode}`), {
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const data = query.data?.map(dashboard => {
    const drillDownItemCodes = dashboard.items
      .filter(d => !!d.drillDown)
      .reduce((codes, d) => {
        const entry = d.drillDown?.itemCodeByEntry;

        if (entry) {
          const values = Object.values(d.drillDown.itemCodeByEntry);
          return [...codes, ...values];
        }
        return codes;
      }, []);

    // Todo: support other report types (including "component" types)
    const dashboardItems = dashboard.items
      .filter(({ type }) => type === 'chart' || type === 'list')
      .filter(view => !drillDownItemCodes.includes(view.code));

    const drillDowns = dashboard.items.filter(view => drillDownItemCodes.includes(view.code));

    return { ...dashboard, items: dashboardItems, drillDowns };
  });

  return { ...query, data };
};
