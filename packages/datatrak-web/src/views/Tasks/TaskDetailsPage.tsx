/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { TaskStatus } from '@tupaia/types';
import { useParams } from 'react-router';
import { Button, PageContainer } from '../../components';
import { TaskPageHeader } from '../../features';
import { useTask } from '../../api';
import { OtherTaskStatus } from '../../types';

export const TaskDetailsPage = () => {
  const { taskId } = useParams();
  const { data: task } = useTask(taskId);

  const showCompleteButton =
    task?.taskStatus === TaskStatus.to_do || task?.taskStatus === OtherTaskStatus.overdue;

  return (
    <PageContainer>
      <TaskPageHeader title="Task details">
        {showCompleteButton && <Button>Complete</Button>}
      </TaskPageHeader>
    </PageContainer>
  );
};
