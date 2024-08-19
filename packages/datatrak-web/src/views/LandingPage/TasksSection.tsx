/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FlexSpaceBetween, TextButton, Button as UIButton } from '@tupaia/ui-components';
import { useCurrentUserContext, useTasks } from '../../api';
import { NoTasksSection, TaskTile } from '../../features/Tasks';
import { ROUTES } from '../../constants';
import { LoadingTile } from '../../components';
import { SectionHeading } from './SectionHeading';

const SectionContainer = styled.section`
  grid-area: tasks;
  display: flex;
  flex-direction: column;
  ${({ theme }) => theme.breakpoints.up('lg')} {
    max-height: 21.5rem;
  }
`;

const Paper = styled.div`
  text-align: center;
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

const Button = styled(UIButton)`
  margin: 0.3rem auto 0;
  display: inline-block;
  padding: 0.1rem 1rem 0.2rem;
  .MuiButton-label {
    font-size: 0.75rem;
  }
`;

export const TasksSection = () => {
  const { id: userId, projectId } = useCurrentUserContext();
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
  const {
    data = { tasks: [], numberOfPages: 0 },
    isLoading,
    isSuccess,
  } = useTasks({ projectId, filters, pageSize: 15 });
  const tasks = data.tasks;
  const showTasksDashboardLink = data.numberOfPages > 1;
  const hasTasks = isSuccess && tasks?.length > 0;

  let Contents: React.ReactNode;
  if (isLoading) {
    Contents = <LoadingTile count={4} />;
  } else if (hasTasks) {
    Contents = (
      <>
        {tasks.map(task => (
          <TaskTile key={task.id} task={task} />
        ))}
        {showTasksDashboardLink && (
          <Button component={Link} to={ROUTES.TASKS}>
            View more
          </Button>
        )}
      </>
    );
  } else {
    Contents = <NoTasksSection />;
  }

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
      <Paper>{Contents}</Paper>
    </SectionContainer>
  );
};
