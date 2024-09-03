/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { generatePath, Link } from 'react-router-dom';
import { ROUTES } from '../../constants';
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
  border: 1px solid ${({ theme }) => theme.palette.divider};
  width: 100%;
  padding: 0.4rem 0.7rem;
  margin-block-end: 0.5rem;

  .MuiButton-root {
    padding: 0.2rem 1.2rem;
  }

  .MuiButton-label {
    font-size: 0.75rem;
  }

  @media screen and (max-width: 30rem) {
    .MuiButtonBase-root {
      padding-inline: 0.8rem;
    }
  }

  @media screen and (max-width: 24rem) {
    flex-direction: column;
    .MuiButtonBase-root {
      margin-block-end: 0.4rem;
      margin-block-start: 0.8rem;
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
  font-size: 0.75rem;
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
  const surveyLink = `${path}/1`;
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
        <ButtonLink to={surveyLink} component={Link} state={{ primaryEntityCode: entity.code }}>
          Complete task
        </ButtonLink>
      </TileRight>
    </TileContainer>
  );
};
