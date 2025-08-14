import { useQuery } from '@tanstack/react-query';
import { DatatrakWebTaskMetricsRequest } from '@tupaia/types';
import { get } from '../api';

export const useTaskMetrics = (projectId?: string) => {
  return useQuery<DatatrakWebTaskMetricsRequest.ResBody>(
    ['taskMetric', projectId],
    () => get(`taskMetrics/${projectId}`),
    {
      enabled: !!projectId,
    },
  );
};
