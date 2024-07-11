/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';
import { FlexColumn, FlexSpaceBetween } from '@tupaia/ui-components';
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

const TextButton = styled(Button)`
  font-size: 0.75rem;
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
  const { data, isFetching } = useTasks({ filters });

  if (isFetching) {
    return 'loading...';
  }

  return (
    <SectionContainer>
      <FlexSpaceBetween>
        <SectionHeading>My tasks</SectionHeading>
        {data.tasks.length < 0 && (
          <TextButton component={Link} to={ROUTES.TASKS}>
            View more...
          </TextButton>
        )}
      </FlexSpaceBetween>
      <Paper>
        {data?.tasks?.length < 0 ? (
          <FlexColumn>
            {data?.tasks.map(task => (
              <TaskTile key={task.id} task={task} />
            ))}
          </FlexColumn>
        ) : (
          <NoTasksSection />
        )}
      </Paper>
    </SectionContainer>
  );
};
