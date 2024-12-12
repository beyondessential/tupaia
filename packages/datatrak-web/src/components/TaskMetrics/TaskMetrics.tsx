import React from 'react';
import styled from 'styled-components';
import { TaskMetric } from './TaskMetric';
import { useCurrentUserContext, useTaskMetrics } from '../../api';

const TaskMetricsContainer = styled.div`
  margin-block-end: 0;
  gap: 0.2rem;
  flex: 1;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-left: 1rem;
  ${({ theme }) => theme.breakpoints.down('sm')} {
    display: none;
  }
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
