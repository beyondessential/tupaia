/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { hasBESAdminAccess } from '../../permissions';
import { createTaskDBFilter } from '../tasks/assertTaskPermissions';

export const createTaskCommentDBFilter = async (accessPolicy, models, criteria, options) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return { dbConditions: criteria, dbOptions: options };
  }
  const { dbConditions } = await createTaskDBFilter(accessPolicy, models);

  const taskIds = await models.task.find(
    {
      ...dbConditions,
      id: criteria.task_id ?? undefined,
    },
    { columns: ['task.id'] },
  );

  if (!taskIds.length) {
    // if the user doesn't have access to any tasks, return a condition that will return no results
    return { dbConditions: { id: -1 }, dbOptions: options };
  }

  return {
    dbConditions: {
      ...criteria,
      task_id: {
        comparator: 'IN',
        comparisonValue: taskIds.map(task => task.id), // this will include any task_id filters because the list of tasks was already filtered by the dbConditions
      },
    },
    dbOptions: options,
  };
};
