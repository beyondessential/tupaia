/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from '@tanstack/react-query';
import { DatatrakWebTaskMetricsRequest } from '@tupaia/types';
import { get } from '../api';

export const useTaskMetrics = (projectId?: string) => {
  return useQuery(
    ['taskMetric', projectId],
    (): Promise<DatatrakWebTaskMetricsRequest.ResBody> => get(`taskMetrics/${projectId}`),
    {
      enabled: !!projectId,
    },
  );
};
