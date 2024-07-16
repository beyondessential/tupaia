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

  const showCompleteButton =
    task && task.taskStatus !== TaskStatus.completed && task.taskStatus !== TaskStatus.cancelled;

  const surveyUrl = task
    ? generatePath(ROUTES.SURVEY_SCREEN, {
        countryCode: task?.entity?.countryCode,
        surveyCode: task?.survey?.code,
        screenNumber: '1',
      })
    : '';

  const from = useFromLocation();
  return (
    <>
      <TaskPageHeader title="Task details">
        {showCompleteButton && (
          <ButtonWrapper>
            <Button to={surveyUrl} state={{ from }}>
              Complete
            </Button>
            <TaskActionsMenu {...task} />
          </ButtonWrapper>
        )}
      </TaskPageHeader>
      {isLoading && <SpinningLoader />}
      {task && <TaskDetails task={task} />}
    </>
  );
};
