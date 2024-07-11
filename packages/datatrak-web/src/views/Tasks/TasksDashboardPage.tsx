/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { TaskPageHeader, TasksTable } from '../../features';

export const TasksDashboardPage = () => {
  return (
    <>
      <TaskPageHeader title="Tasks" />
      <TasksTable />
    </>
  );
};
