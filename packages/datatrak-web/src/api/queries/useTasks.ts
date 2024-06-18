/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { DatatrakWebTasksRequest } from '@tupaia/types';
import { get } from '../api';

type Filter = {
  id: string;
  value: string;
};

export const useTasks = (
  projectId?: string,
  pageSize?: number,
  page?: number,
  filters: Filter[] = [],
) => {
  return useQuery(
    ['tasks', projectId, pageSize, page, filters],
    (): Promise<DatatrakWebTasksRequest.ResBody> =>
      get('tasks', {
        params: {
          pageSize,
          page,
          filters,
        },
        enabled: !!projectId,
      }),
  );
};
