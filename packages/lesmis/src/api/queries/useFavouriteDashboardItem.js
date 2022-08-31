import { stringifyQuery } from '@tupaia/utils';
import { useQuery } from 'react-query';
import { get } from '../api';
import { QUERY_OPTIONS } from './constants';

export const useFavouriteDashboardItem = ({ userId }) => {
  const endpoint = stringifyQuery(null, 'userFavouriteDashboardItems', {
    columns: JSON.stringify(['dashboard_item.code']),
    filter: JSON.stringify({ user_id: userId }),
  });

  const query = useQuery(
    ['userFavouriteDashboardItems', userId],
    () => get(endpoint),
    QUERY_OPTIONS,
  );
  const { data = [] } = query;
  const favouriteDashboardItems = data.map(
    ({ 'dashboard_item.code': dashboardItemCode }) => dashboardItemCode,
  );

  return { ...query, data: favouriteDashboardItems };
};
