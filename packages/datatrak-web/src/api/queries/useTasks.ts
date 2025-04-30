import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { DatatrakWebTasksRequest } from '@tupaia/types';
import { get } from '../api';
import { SortingRule } from 'react-table';

interface Filter {
  id: string;
  value: string | object;
}

export interface UseTasksQueryParams {
  projectId?: string;
  pageSize?: number;
  page?: number;
  filters?: Filter[];
  sortBy?: SortingRule<
    // HACK: This should be derived from `DatatrakWebTasksRequest`
    Record<'assignee_name' | 'due_date' | 'entity.name' | 'survey.name', unknown>
  >[];
}

export const useTasks = (
  { projectId, pageSize, page, filters = [], sortBy }: UseTasksQueryParams,
  useQueryOptions?: UseQueryOptions<DatatrakWebTasksRequest.ResBody>,
) => {
  return useQuery<DatatrakWebTasksRequest.ResBody>(
    ['tasks', projectId, pageSize, page, filters, sortBy],
    () =>
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
      ...useQueryOptions,
      enabled: !!projectId && (useQueryOptions?.enabled ?? true),
      // This needs to be true so that when changing the page number, the total number of records is not reset
      keepPreviousData: true,
    },
  );
};
