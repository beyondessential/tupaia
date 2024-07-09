/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { DatatrakWebTasksRequest, TaskStatus } from '@tupaia/types';
import { generatePath, useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '@tupaia/ui-components';
import { ROUTES } from '../../../constants';

type Task = DatatrakWebTasksRequest.ResBody['tasks'][0];

const ActionButtonComponent = styled(Button).attrs({
  color: 'primary',
  size: 'small',
})`
  padding-inline: 1.2rem;
  padding-block: 0.4rem;
  width: 100%;
  .MuiButton-label {
    font-size: 0.75rem;
    line-height: normal;
  }
  .cell-content:has(&) {
    padding-block: 0.2rem;
    padding-inline-start: 1.5rem;
  }
`;

export const ActionButton = (task: Task) => {
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
      to={surveyLink}
      variant="contained"
      state={{
        from: JSON.stringify(location),
      }}
    >
      Complete
    </ActionButtonComponent>
  );
};
