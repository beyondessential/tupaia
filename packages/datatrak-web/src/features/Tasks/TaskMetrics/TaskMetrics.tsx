import React from 'react';
import styled from 'styled-components';
import { TaskMetric } from './TaskMetric.tsx';
import { useCurrentUserContext, useTaskMetrics } from '../../../api';

const TaskMetricsContainer = styled.div`
  display: flex;
  flex: 1;
  gap: inherit;
  justify-content: space-between;
  max-inline-size: 60rem;
`;

export const TaskMetrics = () => {
  const { projectId } = useCurrentUserContext();
  const { data: metrics, isLoading } = useTaskMetrics(projectId);
  return (
    <TaskMetricsContainer>
      <TaskMetric text="Unassigned tasks" number={metrics?.unassignedTasks} isLoading={isLoading} />
      <TaskMetric text="Overdue tasks" number={metrics?.overdueTasks} isLoading={isLoading} />
      <TaskMetric
        text="On-time completion rate"
        number={`${metrics?.onTimeCompletionRate}%`}
        isLoading={isLoading}
      />
    </TaskMetricsContainer>
  );
};
