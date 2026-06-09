import { TaskStatus } from '@tupaia/types';
import { UseTasksQueryParams } from '../../api/queries/useTasks';

export const consolidateFilters = ({
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
