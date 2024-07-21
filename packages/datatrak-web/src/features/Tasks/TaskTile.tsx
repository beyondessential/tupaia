/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { generatePath, Link } from 'react-router-dom';
import ChatIcon from '@material-ui/icons/ChatBubbleOutline';
import { ROUTES } from '../../constants';
import { StatusPill } from './StatusPill';
import { displayDate } from '../../utils';
import { ButtonLink } from '../../components';
import { CommentsCount } from './CommentsCount';

const TileContainer = styled.div`
  display: flex;
  text-align: left;
  justify-content: space-between;
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
    margin-inline-end: 0.6rem;
  }
`;

const TileRight = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const TaskTile = ({ task }) => {
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
          <span>{displayDate(dueDate)}</span>
          <CommentsCount commentsCount={task.commentsCount} />
        </TileContent>
      </TileLeft>
      <TileRight>
        <ButtonLink to={surveyLink} component={Link} state={{ primaryEntity: entity.id }}>
          Complete task
        </ButtonLink>
      </TileRight>
    </TileContainer>
  );
};
