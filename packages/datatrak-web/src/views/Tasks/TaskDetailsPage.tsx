/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { TaskStatus } from '@tupaia/types';
import { generatePath, useParams } from 'react-router-dom';
import { Button, PageContainer } from '../../components';
import { TaskPageHeader } from '../../features';
import { useTask } from '../../api';
import { OtherTaskStatus } from '../../types';
import { ROUTES } from '../../constants';
import { useFromLocation } from '../../utils';

export const TaskDetailsPage = () => {
  const { taskId } = useParams();
  const { data: task } = useTask(taskId);

  const showCompleteButton =
    task?.taskStatus === TaskStatus.to_do || task?.taskStatus === OtherTaskStatus.overdue;

  const surveyUrl = generatePath(ROUTES.SURVEY_SCREEN, {
    countryCode: task?.entity?.countryCode,
    surveyCode: task?.survey?.code,
    screenNumber: '1',
  });

  const from = useFromLocation();
  return (
    <PageContainer>
      <TaskPageHeader title="Task details">
        {showCompleteButton && (
          <Button to={surveyUrl} state={{ from }}>
            Complete
          </Button>
        )}
      </TaskPageHeader>
    </PageContainer>
  );
};
