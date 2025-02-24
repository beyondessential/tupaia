import React from 'react';
import styled from 'styled-components';
import { generatePath, Link } from 'react-router-dom';
import { PRIMARY_ENTITY_CODE_PARAM, ROUTES } from '../../constants';
import { displayDate } from '../../utils';
import { ButtonLink } from '../../components';
import { StatusPill } from './StatusPill';
import { CommentsCount } from './CommentsCount';

const TileContainer = styled(Link)`
  display: flex;
  text-align: left;
  justify-content: space-between;
  text-decoration: none;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.palette.background.paper};

  inline-size: 100%;
  margin-block-end: 0.5rem;
  padding-block: 0.4rem;
  padding-inline: 0.7rem;

  .MuiButton-root {
    padding-block: 0.2rem;
    padding-inline: 1.2rem;
  }

  .MuiButton-label {
    font-size: 0.75rem;
  }

  ${({ theme }) => theme.breakpoints.up('md')} {
    border: 1px solid ${({ theme }) => theme.palette.divider};
  }

  ${({ theme }) => theme.breakpoints.down('sm')} {
    .MuiButtonBase-root {
      margin-block-end: 0.8rem 0.4rem;
      padding-inline: 0.8rem;
    }
  }

  &:hover {
    background-color: ${({ theme }) => theme.palette.primaryHover};
    border-color: ${({ theme }) => theme.palette.primary.main};
  }
  &:focus-within {
    border-color: ${({ theme }) => theme.palette.primary.main};
  }
`;

const TileTitle = styled.div`
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-block-end: 0.25rem;
  color: ${({ theme }) => theme.palette.text.primary};
`;

const TileLeft = styled.div`
  flex: 1;
  padding-inline-end: 1rem;
  min-width: 0;
`;

const TileContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  font-size: 0.75rem;
  gap: 0.25rem;
  color: ${({ theme }) => theme.palette.text.secondary};
  align-items: center;

  > span {
    text-wrap: nowrap;
    margin-inline-end: 0.6rem;
  }
`;

const TileRight = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const TaskTile = ({ task }) => {
  const { survey, entity, taskStatus, taskDueDate } = task;
  const path = generatePath(ROUTES.SURVEY, {
    surveyCode: survey.code,
    countryCode: entity.countryCode,
  });
  // Link needs to include page number because if the redirect happens, the "from" state is lost
  const surveyLink = `${path}/1?${PRIMARY_ENTITY_CODE_PARAM}=${entity.code}`;
  const taskLink = generatePath(ROUTES.TASK_DETAILS, {
    taskId: task.id,
  });
  return (
    <TileContainer
      to={taskLink}
      state={{
        from: '/',
      }}
    >
      <TileLeft>
        <TileTitle>{survey.name}</TileTitle>
        <TileContent>
          <StatusPill status={taskStatus} />
          <span>{displayDate(taskDueDate)}</span>
          <CommentsCount commentsCount={task.commentsCount} />
        </TileContent>
      </TileLeft>
      <TileRight>
        <ButtonLink to={surveyLink}>Complete task</ButtonLink>
      </TileRight>
    </TileContainer>
  );
};
