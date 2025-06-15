import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { DatatrakWebTasksRequest, TaskStatus } from '@tupaia/types';
import { get } from '../api';
import { SortingRule } from 'react-table';
import { useCurrentUserContext } from '../CurrentUserContext';

interface Filter {
  id: string;
  value: string | { comparator: string; comparisonValue: unknown };
}

export interface UseTasksQueryParams {
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

export const useTasks = (
  {
    projectId,
    allAssignees = false,
    includeCancelled = false,
    includeCompleted = false,
    pageSize,
    page,
    filters = [],
    sortBy,
  }: UseTasksQueryParams,
  useQueryOptions?: UseQueryOptions<DatatrakWebTasksRequest.ResBody>,
) => {
  const { id: userId } = useCurrentUserContext();

  const consolidateFilters = () => {
    const augmented = [...filters];

    // `projectId` and `userId` should be truthy because useQuery is otherwise disabled, but TS
    // server doesn’t know
    if (projectId) augmented.push({ id: 'survey.project_id', value: projectId });
    if (!allAssignees && userId) augmented.push({ id: 'assignee_id', value: userId });

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

  const consolidatedFilters = consolidateFilters();

  return useQuery<DatatrakWebTasksRequest.ResBody>(
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
    () =>
      get('tasks', {
        params: {
          pageSize,
          page,
          filters: consolidatedFilters,
          sort: sortBy?.map(({ id, desc }) => `${id} ${desc ? 'DESC' : 'ASC'}`) ?? [],
        },
      }),
    {
      ...useQueryOptions,
      enabled: !!projectId && !!userId && (useQueryOptions?.enabled ?? true),
      // This needs to be true so that when changing the page number, the total number of records is not reset
      keepPreviousData: true,
    },
  );
};
