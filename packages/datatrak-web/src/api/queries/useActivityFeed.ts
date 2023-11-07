/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useInfiniteQuery } from 'react-query';
import { get } from '../api';
import { DatatrakWebActivityFeedRequest } from '@tupaia/types';

export const useActivityFeed = () => {
  return useInfiniteQuery(
    ['activityFeed'],
    ({ pageParam = 0 }): Promise<DatatrakWebActivityFeedRequest.ResBody> =>
      get('activityFeed', {
        params: {
          page: pageParam,
        },
      }),
    {
      getNextPageParam: (data, pages) => (data?.hasMorePages ? pages.length : null),
    },
  );
};
