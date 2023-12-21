/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useInfiniteQuery } from 'react-query';
import { DatatrakWebActivityFeedRequest } from '@tupaia/types';
import { get } from '../api';

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
      getNextPageParam: (data, pages) => {
        if (!data) return 0;
        return data?.hasMorePages ? pages.length : undefined;
      },
    },
  );
};
