/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { generatePath, Link, useLocation } from 'react-router-dom';
import { TaskStatus } from '@tupaia/types';
import { ROUTES } from '../../../constants';
import { Button } from '../../../components';
import { Task } from '../../../types';

const ActionButtonComponent = styled(Button).attrs({
  color: 'primary',
  size: 'small',
})`
  padding-inline: 1.2rem;
  padding-block: 0.4rem;
  .MuiButton-label {
    font-size: 0.75rem;
    line-height: normal;
  }
  .cell-content:has(&) {
    padding-block: 0.2rem;
    padding-inline-start: 1.5rem;
  }
`;

export const TaskCompleteButton = (task: Task) => {
  const location = useLocation();
  if (!task) return null;
  const { assigneeId, survey, entity, status } = task;
  if (status === TaskStatus.cancelled || status === TaskStatus.completed) return null;
  if (!assigneeId) {
    return <ActionButtonComponent variant="outlined">Assign</ActionButtonComponent>;
  }

  const surveyLink = generatePath(ROUTES.SURVEY, {
    surveyCode: survey.code,
    countryCode: entity.countryCode,
  });
  return (
    <ActionButtonComponent
      component={Link}
      to={`${surveyLink}/1`}
      variant="contained"
      state={{
        from: location.pathname,
      }}
    >
      Complete
    </ActionButtonComponent>
  );
};
