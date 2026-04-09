import React from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';

import { FlexSpaceBetween, Button as UIButton } from '@tupaia/ui-components';

import { useCurrentUserContext, useTasks } from '../../api';
import { TileSkeletons } from '../../components';
import { ROUTES } from '../../constants';
import { NoTasksSection, TaskTile } from '../../features/Tasks';
import { useIsMobile } from '../../utils';
import { SectionHeading } from './SectionHeading';

const SectionContainer = styled.section`
  grid-area: --tasks;
  display: flex;
  flex-direction: column;
`;

const Paper = styled.div<{ $hasTasks?: boolean }>`
  flex: 1;
  text-align: center;
  overflow: auto;
  background: ${({ theme }) => theme.palette.background.paper};
  padding-block: 1rem;
  padding-inline: 1.25rem;
  border-radius: 0.625rem;

  ${({ theme, $hasTasks }) =>
    $hasTasks &&
    css`
      ${theme.breakpoints.down('sm')} {
        background: none;
        padding: 0;
      }
    `}
`;

const Button = styled(UIButton)`
  margin: 0.3rem auto 0;
  display: inline-block;
  padding-block: 0.1rem 0.2rem;
  padding-inline: 1rem;
  .MuiButton-label {
    font-size: 0.75rem;
  }
`;

const ViewMoreButton = styled(Button).attrs({ variant: 'text', color: 'default' })`
  padding-block: 0;
  margin-block-end: 0.75rem;
  margin-inline: 0;

  &:hover {
    text-decoration: underline;
    background-color: unset;
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

  const isMobile = useIsMobile();
  const {
    data = { tasks: [], numberOfPages: 0 },
    isLoading,
    isSuccess,
  } = useTasks({
    projectId,
    filters,
    pageSize: isMobile ? 3 : 15,
  });

  const tasks = data.tasks ?? [];
  const hasTasks = isSuccess && tasks?.length > 0;

  // Tasks view accessible via bottom navigation bar in mobile
  if (isMobile && !hasTasks) return null;

  const renderContents = () => {
    if (isLoading) {
      return <TileSkeletons count={4} tileSkeletonProps={{ lineCount: 1 }} />;
    }
    if (!hasTasks) {
      return <NoTasksSection />;
    }

    return tasks.map(task => <TaskTile key={task.id} task={task} />);
  };

  return (
    <SectionContainer>
      <FlexSpaceBetween as="header">
        <SectionHeading>My tasks</SectionHeading>
        {hasTasks && !isMobile && (
          <ViewMoreButton component={Link} to={ROUTES.TASKS}>
            View more
          </ViewMoreButton>
        )}
      </FlexSpaceBetween>
      <Paper $hasTasks={hasTasks}>{renderContents()}</Paper>
    </SectionContainer>
  );
};
