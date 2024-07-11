/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { DatatrakWebTasksRequest } from '@tupaia/types';
import { get } from '../api';

type Filter = {
  id: string;
  value: string;
};

type SortBy = {
  id: string;
  desc: boolean;
};

export const useTasks = (
  projectId?: string,
  pageSize?: number,
  page?: number,
  filters: Filter[] = [],
  sortBy?: SortBy[],
) => {
  return useQuery(
    ['tasks', projectId, pageSize, page, filters, sortBy],
    (): Promise<DatatrakWebTasksRequest.ResBody> =>
      get('tasks', {
        params: {
          pageSize,
          page,
          filters: [
            ...filters,
            {
              id: 'survey.project_id',
              value: projectId,
            },
          ],
          sort: sortBy?.map(({ id, desc }) => `${id} ${desc ? 'DESC' : 'ASC'}`) ?? [],
        },
      }),
    {
      enabled: !!projectId,
      // This needs to be true so that when changing the page number, the total number of records is not reset
      keepPreviousData: true,
    },
  );
};
