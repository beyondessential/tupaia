/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { TaskStatus } from '@tupaia/types';
import { generatePath, useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '@tupaia/ui-components';
import { ROUTES } from '../../../constants';
import { Task } from '../../../types';

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

interface ActionButtonProps {
  task: Task;
  onAssignTask: (task: Task | null) => void;
}

export const ActionButton = ({ task, onAssignTask }: ActionButtonProps) => {
  const location = useLocation();
  if (!task) return null;
  const { assigneeId, survey, entity, status } = task;
  if (status === TaskStatus.cancelled || status === TaskStatus.completed) return null;
  const openAssignTaskModal = () => {
    onAssignTask(task);
  };
  if (!assigneeId) {
    return (
      <ActionButtonComponent variant="outlined" onClick={openAssignTaskModal}>
        Assign
      </ActionButtonComponent>
    );
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
