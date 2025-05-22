import { useQuery } from '@tanstack/react-query';
import { DatatrakWebTasksRequest } from '@tupaia/types';
import { get } from '../api';

type Filter = {
  id: string;
  value: string | object;
};

type SortBy = {
  id: string;
  desc: boolean;
};

interface UseTasksOptions {
  projectId?: string;
  pageSize?: number;
  page?: number;
  filters?: Filter[];
  sortBy?: SortBy[];
}

export const useTasks = ({ projectId, pageSize, page, filters = [], sortBy }: UseTasksOptions) => {
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
      enabled: !!projectId,
      // This needs to be true so that when changing the page number, the total number of records is not reset
      keepPreviousData: true,
      placeholderData: {
        count: 0,
        numberOfPages: 0,
        tasks: [],
      },
    },
  );
};
