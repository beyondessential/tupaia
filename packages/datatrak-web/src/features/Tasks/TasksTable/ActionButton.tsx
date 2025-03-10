import React from 'react';
import { TaskStatus } from '@tupaia/types';
import { generatePath, useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '@tupaia/ui-components';
import { PRIMARY_ENTITY_CODE_PARAM, ROUTES } from '../../../constants';
import { SingleTaskResponse } from '../../../types';
import { AssignTaskModal } from './AssignTaskModal';

const ActionButtonComponent = styled(Button).attrs({
  color: 'primary',
  size: 'small',
})`
  padding-inline: 1.2rem;
  padding-block: 0.4rem;
  width: 6.5rem;
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
  task: SingleTaskResponse;
}

export const ActionButton = ({ task }: ActionButtonProps) => {
  const location = useLocation();
  if (!task) return null;
  const { assignee, survey, entity, taskStatus } = task;
  if (taskStatus === TaskStatus.cancelled || taskStatus === TaskStatus.completed) return null;
  if (!assignee?.id) {
    return (
      <AssignTaskModal
        task={task}
        Button={({ onClick }) => (
          <ActionButtonComponent onClick={onClick} variant="outlined">
            Assign
          </ActionButtonComponent>
        )}
      />
    );
  }

  const path = generatePath(ROUTES.SURVEY, {
    surveyCode: survey.code,
    countryCode: entity.countryCode,
  });
  // Link needs to include page number because if the redirect happens, the "from" state is lost
  const surveyLink = `${path}/1?${PRIMARY_ENTITY_CODE_PARAM}=${entity.code}`;

  return (
    <ActionButtonComponent
      component={Link}
      to={surveyLink}
      variant="contained"
      state={{
        from: location.pathname,
      }}
    >
      Complete task
    </ActionButtonComponent>
  );
};
