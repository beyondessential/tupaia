/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { PageContainer } from '../../components';
import { TaskPageHeader, TasksTable } from '../../features';

export const TasksDashboardPage = () => {
  return (
    <PageContainer>
      <TaskPageHeader title="Tasks" />
      <TasksTable />
    </PageContainer>
  );
};
