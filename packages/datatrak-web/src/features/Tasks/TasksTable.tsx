/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { useCurrentUserContext, useTasks } from '../../api';

export const TasksTable = () => {
  const { projectId } = useCurrentUserContext();
  const { data: tasks } = useTasks(projectId);
  console.log(tasks);
  return <div>Tasks table</div>;
};
