/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { DatatrakWebTasksRequest } from '@tupaia/types';
import { get } from '../api';

export const useTasks = (projectId?: string, pageSize?: number, page?: number, filters = {}) => {
  return useQuery(
    ['tasks', projectId, pageSize, page, filters],
    (): Promise<DatatrakWebTasksRequest.ResBody[]> =>
      get('tasks', {
        params: {
          pageSize,
          page,
          filter: {
            'survey.project_id': projectId,
            ...filters,
          },
        },
        enabled: !!projectId,
      }),
  );
};
