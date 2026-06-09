import { UseTaskMetricsLocalContext } from '../../api/queries/useTaskMetrics';

export const getTaskMetrics = async ({ models, projectId }: UseTaskMetricsLocalContext) => {
  const unassignedTasks = await models.task.countUnassignedTasks(projectId);
  const overdueTasks = await models.task.countOverdueTasks(projectId);
  const onTimeCompletionRate = await models.task.calculateOnTimeCompletionRate(projectId);

  return {
    unassignedTasks,
    overdueTasks,
    onTimeCompletionRate,
  };
};
