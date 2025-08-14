import { useQuery } from '@tanstack/react-query';
import { get } from '../api';
import { QUERY_OPTIONS } from './constants';

/**
 * Gets a list of all the drilldown codes for a list of dashboard items
 * @param dashboardItems
 * @returns {*}
 */
const getDrillDownCodes = dashboardItems =>
  dashboardItems
    .filter(d => !!d.drillDown)
    .reduce((codes, d) => {
      const itemCodeByEntry = d.drillDown?.itemCodeByEntry;

      if (itemCodeByEntry) {
        const additionalCodes = Object.values(d.drillDown.itemCodeByEntry);
        return [...codes, ...additionalCodes];
      }
      return codes;
    }, []);

export const useDashboardData = ({ entityCode, includeDrillDowns = true, isFavouriteOnly }) => {
  const query = useQuery(
    ['dashboard', entityCode],
    () => get(`dashboard/${entityCode}`),
    QUERY_OPTIONS,
  );

  const data = query.data?.map(dashboard => {
    const drillDownItemCodes = getDrillDownCodes(dashboard.items);

    let dashboardItems = dashboard.items
      .filter(({ type }) => type === 'chart' || type === 'list') // Only show supported chart types
      .filter(({ isFavourite }) => (isFavouriteOnly ? isFavourite : true));

    if (!includeDrillDowns) {
      // Remove the drill downs from the main dashboard items list
      dashboardItems = dashboardItems.filter(view => !drillDownItemCodes.includes(view.code));
    }

    return { ...dashboard, items: dashboardItems };
  });

  return { ...query, data };
};
