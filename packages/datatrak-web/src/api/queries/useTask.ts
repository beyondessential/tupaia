/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { DatatrakWebTasksRequest } from '@tupaia/types';
import { get } from '../api';

export const useTask = (taskId?: string) => {
  return useQuery(
    ['tasks', taskId],
    (): Promise<DatatrakWebTasksRequest.ResBody['tasks'][0]> => get(`tasks/${taskId}`),
    {
      enabled: !!taskId,
    },
  );
};
