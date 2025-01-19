import React from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';

import { FlexSpaceBetween, Button as UIButton } from '@tupaia/ui-components';

import { useCurrentUserContext, useTasks } from '../../api';
import { ROUTES } from '../../constants';
import { LoadingTile } from '../../components';
import { NoTasksSection, TaskTile } from '../../features/Tasks';
import { useIsMobile } from '../../utils';
import { SectionHeading } from './SectionHeading';

const SectionContainer = styled.section`
  grid-area: --tasks;
  display: flex;
  flex-direction: column;
  ${({ theme }) => theme.breakpoints.up('lg')} {
    max-height: 21.5rem;
  }
`;

const Paper = styled.div<{ $hasTasks?: boolean }>`
  flex: 1;
  text-align: center;
  overflow: auto;
  background: ${({ theme }) => theme.palette.background.paper};
  padding-block: 1rem;
  padding-inline: 1.25rem;
  border-radius: 10px;

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

  .MuiButton-label {
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
    color: #4e3838;
    font-size: 0.75rem;
  }

  ${({ theme }) => theme.breakpoints.down('sm')} {
    .MuiButton-label {
      font-size: 0.875rem;
    }
  }

  &:hover {
    text-decoration: underline;
    background-color: initial;
  }
`;

const TopViewMoreButton = styled(ViewMoreButton)`
  ${({ theme }) => theme.breakpoints.down('sm')} {
    display: none;
  }
`;

const DesktopButton = Button;
const MobileButton = styled(ViewMoreButton)`
  float: right;
`;

const ViewMoreTasksButton = ({ numberOfPages }) => {
  if (numberOfPages <= 1) return null;
  const Button = useIsMobile() ? MobileButton : DesktopButton;
  return (
    <Button component={Link} to={ROUTES.TASKS}>
      View more
    </Button>
  );
};

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
  } = useTasks({ projectId, filters, pageSize: isMobile ? 3 : 15 });
  const tasks = data.tasks;
  const hasTasks = isSuccess && tasks?.length > 0;

  const renderContents = () => {
    if (isLoading) {
      return <LoadingTile count={4} />;
    }
    if (!hasTasks) {
      return <NoTasksSection />;
    }

    return (
      <>
        {tasks.map(task => (
          <TaskTile key={task.id} task={task} />
        ))}
        <ViewMoreTasksButton numberOfPages={data.numberOfPages} />
      </>
    );
  };

  return (
    <SectionContainer>
      <FlexSpaceBetween as="header">
        <SectionHeading>My tasks</SectionHeading>
        {hasTasks && (
          <TopViewMoreButton component={Link} to={ROUTES.TASKS}>
            View more
          </TopViewMoreButton>
        )}
      </FlexSpaceBetween>
      <Paper $hasTasks={hasTasks}>{renderContents()}</Paper>
    </SectionContainer>
  );
};
