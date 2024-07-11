/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { generatePath, Link } from 'react-router-dom';
import ChatIcon from '@material-ui/icons/ChatBubbleOutline';
import { ROUTES } from '../../constants';
import { StatusPill } from './StatusPill';
import { displayDate } from '../../utils';
import { ButtonLink } from '../../components';
import React from 'react';
import styled from 'styled-components';

const TileContainer = styled.div`
  display: flex;
  justify-content: space-between;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  height: 60px;
  width: 100%;
  padding: 6px 11px 5px;
  margin-bottom: 0.5rem;

  .MuiButton-root {
    padding: 3px 16px;
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
  margin-bottom: 4px;
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

  > span {
    margin-right: 5px;
  }
`;

const TileRight = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const CommentsContainer = styled.div`
  display: flex;
  align-items: center;

  .MuiSvgIcon-root {
    font-size: 1rem;
    margin-right: 0.2rem;
  }
`;

const Comments = () => {
  return (
    <CommentsContainer>
      <ChatIcon />2
    </CommentsContainer>
  );
};

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
          <Comments />
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
