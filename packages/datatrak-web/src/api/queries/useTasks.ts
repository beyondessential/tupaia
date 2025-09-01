import { UseQueryOptions } from '@tanstack/react-query';
import type { SortingRule } from 'react-table';

import { DatatrakWebTasksRequest, TaskStatus } from '@tupaia/types';

import { get } from '../api';
import { useCurrentUserContext } from '../CurrentUserContext';
import { LocalContext, useDatabaseQuery } from './useDatabaseQuery';
import { useIsOfflineFirst } from '../offlineFirst';
import { getTasks } from '../../database/task/getTasks';

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

interface UseTasksLocalContext extends LocalContext {
  projectId?: string;
  allAssignees?: boolean;
  includeCancelled?: boolean;
  includeCompleted?: boolean;
  userId?: string;
  pageSize?: number;
  page?: number;
  filters?: Filter[];
  sortBy?: SortingRule<
    // HACK: This should be derived from `DatatrakWebTasksRequest`
    Record<'assignee_name' | 'due_date' | 'entity.name' | 'survey.name', unknown>
  >[];
}

const consolidateFilters = ({
  filters = [],
  projectId,
  allAssignees,
  includeCancelled,
  includeCompleted,
  userId,
}: UseTasksQueryParams) => {
  const augmented = [...filters];

  // `projectId` and `userId` should be truthy because useQuery is otherwise disabled, but TS
  // server doesn’t know
  if (projectId) {
    augmented.push({ id: 'survey.project_id', value: projectId });
  }
  if (!allAssignees && userId) {
    augmented.push({ id: 'assignee_id', value: userId });
  }

  if (!filters.some(f => f.id === 'task_status')) {
    // If task status filter is already present, don’t override it
    if (!includeCompleted && !includeCancelled) {
      augmented.push({
        id: 'task_status',
        value: {
          comparator: 'NOT IN',
          comparisonValue: [TaskStatus.completed, TaskStatus.cancelled],
        },
      });
    } else {
      if (!includeCancelled) {
        augmented.push({
          id: 'task_status',
          value: {
            comparator: 'NOT IN',
            comparisonValue: [TaskStatus.cancelled],
          },
        });
      }
      if (!includeCompleted) {
        augmented.push({
          id: 'task_status',
          value: {
            comparator: 'NOT IN',
            comparisonValue: [TaskStatus.completed],
          },
        });
      }
    }
  }

  return augmented;
};

const getRemoteTasks = async ({
  projectId,
  allAssignees,
  includeCancelled,
  includeCompleted,
  userId,
  pageSize,
  page,
  filters,
  sortBy,
}: UseTasksLocalContext) => {
  return get('tasks', {
    params: {
      pageSize,
      page,
      filters: consolidateFilters({
        filters,
        projectId,
        allAssignees,
        includeCancelled,
        includeCompleted,
        userId,
      }),
      sort: sortBy?.map(({ id, desc }) => `${id} ${desc ? 'DESC' : 'ASC'}`) ?? [],
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

  return useDatabaseQuery<
    DatatrakWebTasksRequest.ResBody,
    unknown,
    DatatrakWebTasksRequest.ResBody,
    readonly unknown[],
    LocalContext
  >(
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
        allAssignees,
        includeCancelled,
        includeCompleted,
        userId,
        pageSize,
        page,
        filters,
        sortBy,
      },
    },
  );
};
