import { stringifyQuery } from '@tupaia/utils';
import { useQuery } from 'react-query';
import { get } from '../api';
import { QUERY_OPTIONS } from './constants';

export const LIKE = 'LIKE';
export const DISLIKE = 'DISLIKE';
export const IDLE = 'IDLE';

export const useFavouriteDashboardItem = ({ userId }) => {
  const endpoint = stringifyQuery(null, 'userFavouriteDashboardItem', {
    columns: JSON.stringify(['dashboard_item.code', 'user_id']),
    filter: JSON.stringify({ user_id: userId }),
  });

  return useQuery(['userFavouriteDashboardItem'], () => get(endpoint), QUERY_OPTIONS);
};
