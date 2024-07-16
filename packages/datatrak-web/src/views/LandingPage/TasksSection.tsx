/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FlexSpaceBetween, TextButton } from '@tupaia/ui-components';
import { SectionHeading } from './SectionHeading';
import { useCurrentUserContext, useTasks } from '../../api';
import { NoTasksSection, TaskTile } from '../../features/Tasks';
import { ROUTES } from '../../constants';

const SectionContainer = styled.section`
  grid-area: tasks;
  display: flex;
  flex-direction: column;
`;

const Paper = styled.div`
  background: ${({ theme }) => theme.palette.background.paper};
  border-radius: 10px;
  flex: 1;
  padding: 1rem 1.25rem;
  overflow: auto;
`;

const ViewMoreButton = styled(TextButton)`
  padding-block: 0;
  margin-block-end: 0.5rem;

  .MuiButton-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: #4e3838;
  }

  &:hover {
    text-decoration: underline;
    background-color: initial;
  }
`;

export const TasksSection = () => {
  const { id: userId } = useCurrentUserContext();
  const filters = [
    { id: 'assignee_id', value: userId as string },
    {
      id: 'task_status',
      value: {
        comparator: 'NOT IN',
        comparisonValue: ['completed', 'cancelled'],
      },
    },
  ];
  const { data, isSuccess } = useTasks({ filters });
  const hasTasks = isSuccess && data?.tasks.length > 0;
  const hasNoTasks = isSuccess && data?.tasks.length === 0;

  return (
    <SectionContainer>
      <FlexSpaceBetween>
        <SectionHeading>My tasks</SectionHeading>
        {hasTasks && (
          <ViewMoreButton component={Link} to={ROUTES.TASKS}>
            View more...
          </ViewMoreButton>
        )}
      </FlexSpaceBetween>
      <Paper>
        {hasTasks && data?.tasks.map(task => <TaskTile key={task.id} task={task} />)}
        {hasNoTasks && <NoTasksSection />}
      </Paper>
    </SectionContainer>
  );
};
