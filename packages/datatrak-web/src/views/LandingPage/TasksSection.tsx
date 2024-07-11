/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';
import { SectionHeading } from './SectionHeading';
import { useCurrentUserContext, useTasks } from '../../api';
import { TaskTile } from '../../features/Tasks/TaskTile';

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

const TasksContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const TextButton = styled(Button)`
  font-size: 0.75rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  const { data } = useTasks({ filters });

  return (
    <SectionContainer>
      <SectionHeader>
        <SectionHeading>My tasks</SectionHeading>
        <TextButton component={Link} to="tasks">
          View more...
        </TextButton>
      </SectionHeader>
      <Paper>
        <TasksContainer>
          {data?.tasks.map(task => (
            <TaskTile key={task.id} task={task} />
          ))}
        </TasksContainer>
      </Paper>
    </SectionContainer>
  );
};
