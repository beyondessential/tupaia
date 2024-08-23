/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Add } from '@material-ui/icons';
import { Button, TaskMetric } from '../../components';
import { useCurrentUserContext, useTaskMetrics } from '../../api';
import { CreateTaskModal, TaskPageHeader, TasksTable } from '../../features';
import { TasksContentWrapper } from '../../layout';

const ButtonContainer = styled.div`
  padding-block-end: 0.5rem;
  margin-block-start: 1rem;
  ${({ theme }) => theme.breakpoints.up('sm')} {
    margin-inline-start: auto;
    margin-block-start: 0;
    padding-block-end: 0;
  }
  ${({ theme }) => theme.breakpoints.down('xs')} {
    align-self: self-end;
  }
`;

const MetricsContainer = styled.div`
  margin-block-end: 0;
  gap: 0.5rem;
  @media (min-width: 600px) {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
  ${({ theme }) => theme.breakpoints.down('xs')} {
    width: inherit;
  }
`;

const CreateButton = styled(Button).attrs({
  color: 'primary',
  variant: 'outlined',
  size: 'small',
})`
  padding-inline-end: 1.2rem;
  // the icon width creates the illusion of more padding on the left, so adjust the padding to compensate
  padding-inline-start: 0.9rem;
`;

const AddIcon = styled(Add)`
  font-size: 1.2rem;
  margin-inline-end: 0.2rem;
`;

const ContentWrapper = styled(TasksContentWrapper)`
  overflow: hidden;
`;

export const TasksDashboardPage = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const toggleCreateModal = () => setCreateModalOpen(!createModalOpen);
  const { projectId } = useCurrentUserContext();
  const { data: metrics, isLoading } = useTaskMetrics(projectId);
  return (
    <>
      <TaskPageHeader title="Tasks" backTo="/">
        <MetricsContainer>
          <TaskMetric
            text="Unassigned tasks"
            number={metrics?.unassignedTasks}
            isLoading={isLoading}
          />
          <TaskMetric text="Overdue tasks" number={metrics?.overdueTasks} isLoading={isLoading} />
          <TaskMetric
            text="On-time completion rate"
            number={`${metrics?.onTimeCompletionRate}%`}
            isLoading={isLoading}
          />
        </MetricsContainer>
        <ButtonContainer>
          <CreateButton onClick={toggleCreateModal}>
            <AddIcon /> Create task
          </CreateButton>
        </ButtonContainer>
      </TaskPageHeader>
      <ContentWrapper>
        <TasksTable />
        {createModalOpen && <CreateTaskModal onClose={toggleCreateModal} />}
      </ContentWrapper>
    </>
  );
};
