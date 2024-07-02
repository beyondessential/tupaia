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

const getProcessedFilters = (filters: Filter[], { projectId }) => {
  const processedFilters = filters;
  // Todo: task_status filter
  // If one is already selected do nothing
  // If none is selected, add one based on the table filter settings
  return [
    ...filters,
    {
      id: 'survey.project_id',
      value: projectId,
    },
  ];
};

export const useTasks = (
  projectId?: string,
  pageSize?: number,
  page?: number,
  filters: Filter[] = [],
  sortBy?: SortBy[],
) => {
  const processedFilters = getProcessedFilters(filters, { projectId });

  return useQuery(
    ['tasks', projectId, pageSize, page, filters, sortBy],
    (): Promise<DatatrakWebTasksRequest.ResBody> =>
      get('tasks', {
        params: {
          pageSize,
          page,
          filters: processedFilters,
          sort: sortBy?.map(({ id, desc }) => `${id} ${desc ? 'DESC' : 'ASC'}`) ?? [],
        },
        enabled: !!projectId,
      }),
  );
};
