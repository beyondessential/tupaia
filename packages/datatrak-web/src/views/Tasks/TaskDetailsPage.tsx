/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { generatePath, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { TaskStatus } from '@tupaia/types';
import { SpinningLoader } from '@tupaia/ui-components';
import { Button } from '../../components';
import { TaskDetails, TaskPageHeader, TaskActionsMenu } from '../../features';
import { useTask } from '../../api';
import { ROUTES } from '../../constants';
import { useFromLocation } from '../../utils';

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  flex: 1;
`;

export const TaskDetailsPage = () => {
  const { taskId } = useParams();
  const { data: task, isLoading } = useTask(taskId);

  const surveyUrl = task
    ? generatePath(ROUTES.SURVEY_SCREEN, {
        countryCode: task?.entity?.countryCode,
        surveyCode: task?.survey?.code,
        screenNumber: '1',
      })
    : '';

  const from = useFromLocation();

  const ButtonComponent = () => {
    if (!task) return null;
    switch (task.taskStatus) {
      case TaskStatus.cancelled: {
        return null;
      }
      case TaskStatus.completed: {
        return (
          <Button to={`?responseId=${task.surveyResponseId}`} variant="outlined">
            View completed survey
          </Button>
        );
      }
      default: {
        return (
          <Button to={surveyUrl} state={{ from }}>
            Complete
          </Button>
        );
      }
    }
  };

  return (
    <>
      <TaskPageHeader title="Task details">
        <ButtonWrapper>
          <ButtonComponent />
          {task && <TaskActionsMenu {...task} />}
        </ButtonWrapper>
      </TaskPageHeader>
      {isLoading && <SpinningLoader />}
      {task && <TaskDetails task={task} />}
    </>
  );
};
