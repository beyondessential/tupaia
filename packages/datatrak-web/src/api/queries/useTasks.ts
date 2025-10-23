import { UseQueryOptions } from '@tanstack/react-query';
import type { SortingRule } from 'react-table';

import { DatatrakWebTasksRequest } from '@tupaia/types';

import { getTasks } from '../../database/task/getTasks';
import { consolidateFilters } from '../../utils/task/consolidateFilters';
import { get } from '../api';
import { useCurrentUserContext } from '../CurrentUserContext';
import { useIsOfflineFirst } from '../offlineFirst';
import { ContextualQueryFunctionContext, useDatabaseQuery } from './useDatabaseQuery';

interface Filter {
  id: string;
  value: string | { comparator: string; comparisonValue: unknown };
}

export interface UseTasksQueryParams {
  userId?: string;
  projectId?: string;
  allAssignees?: boolean;
  includeCancelled?: boolean;
  includeCompleted?: boolean;
  pageSize?: number;
  page?: number;
  filters?: Filter[];
  sortBy?: SortingRule<
    // HACK: This should be derived from `DatatrakWebTasksRequest`
    Record<'assignee_name' | 'due_date' | 'entity.name' | 'survey.name', unknown>
  >[];
}

interface UseTasksLocalContext extends ContextualQueryFunctionContext {
  projectId?: string;
  allAssignees?: boolean;
  includeCancelled?: boolean;
  includeCompleted?: boolean;
  pageSize?: number;
  page?: number;
  filters?: Filter[];
  sortBy?: SortingRule<
    // HACK: This should be derived from `DatatrakWebTasksRequest`
    Record<'assignee_name' | 'due_date' | 'entity.name' | 'survey.name', unknown>
  >[];
}

const getRemoteTasks = async ({ pageSize, page, filters, sortBy }: UseTasksLocalContext) => {
  return await get('tasks', {
    params: {
      pageSize,
      page,
      filters,
      sort: sortBy?.map(({ id, desc }) => `${id} ${desc ? 'DESC' : 'ASC'}`),
    },
  });
};

export const useTasks = (
  {
    allAssignees = false,
    filters = [],
    includeCancelled = false,
    includeCompleted = false,
    page,
    pageSize,
    projectId,
    sortBy,
  }: UseTasksQueryParams,
  useQueryOptions?: UseQueryOptions<DatatrakWebTasksRequest.ResBody>,
) => {
  const { id: userId } = useCurrentUserContext();
  const isOfflineFirst = useIsOfflineFirst();

  const processedFilters = consolidateFilters({
    filters,
    projectId,
    allAssignees,
    includeCancelled,
    includeCompleted,
    userId,
  });
  return useDatabaseQuery<DatatrakWebTasksRequest.ResBody>(
    [
      'tasks',
      projectId,
      pageSize,
      page,
      allAssignees,
      includeCancelled,
      includeCompleted,
      filters,
      sortBy,
    ],
    isOfflineFirst ? getTasks : getRemoteTasks,
    {
      ...useQueryOptions,
      enabled: !!projectId && !!userId && (useQueryOptions?.enabled ?? true),
      // This needs to be true so that when changing the page number, the total number of records is not reset
      keepPreviousData: true,
      placeholderData: {
        count: 0,
        numberOfPages: 0,
        tasks: [],
      },
      localContext: {
        projectId,
        pageSize,
        page,
        filters: processedFilters,
        sortBy,
      },
    },
  );
};
