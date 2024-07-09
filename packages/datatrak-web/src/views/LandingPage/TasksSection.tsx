/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import { generatePath, Link } from 'react-router-dom';
import { ButtonLink } from '../../components';
import { SectionHeading } from './SectionHeading';
import { StatusPill } from '../../features/Tasks/StatusPill';
import { displayDate } from '../../utils';
import { useCurrentUserContext, useTasks } from '../../api';
import { ROUTES } from '../../constants';

const SectionContainer = styled.section`
  grid-area: tasks;
  display: flex;
  flex-direction: column;
  max-height: 16rem;
  height: 16rem;
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

const TileContainer = styled.div`
  display: flex;
  justify-content: space-between;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  height: 60px;
  width: 100%;
  padding: 5px 10px;
  margin-bottom: 0.5rem;

  .MuiButton-root {
    padding: 2px 5px;
  }

  .MuiButton-label {
    font-size: 12px;
  }
`;

const TileTitle = styled.div`
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
  color: ${({ theme }) => theme.palette.text.primary};
`;

const TileLeft = styled.div`
  flex: 1;
  padding-right: 1rem;
  min-width: 0;
`;

const TileContent = styled.div`
  display: flex;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.palette.text.secondary};
  align-items: center;
`;

const TileRight = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 80px;
`;

const TextButton = styled(Button)`
  font-size: 0.75rem;
`;

const Tile = ({ task }) => {
  const { survey, entity, taskStatus, dueDate } = task;
  const surveyLink = generatePath(ROUTES.SURVEY, {
    surveyCode: survey.code,
    countryCode: entity.countryCode,
  });
  return (
    <TileContainer>
      <TileLeft>
        <TileTitle>{survey.name}</TileTitle>
        <TileContent>
          <StatusPill status={taskStatus} />
          {displayDate(dueDate)}
        </TileContent>
      </TileLeft>
      <TileRight>
        <ButtonLink to={surveyLink} component={Link}>
          Complete
        </ButtonLink>
      </TileRight>
    </TileContainer>
  );
};

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
            <Tile key={task.id} task={task} />
          ))}
        </TasksContainer>
      </Paper>
    </SectionContainer>
  );
};
