import { useQuery } from '@tanstack/react-query';
import { DatatrakWebTaskMetricsRequest } from '@tupaia/types';
import { get } from '../api';
import { useDatabaseQuery } from './useDatabaseQuery';
import { useIsOfflineFirst } from '../offlineFirst';
import { getTaskMetrics } from '../../database';
import { DatatrakWebModelRegistry } from '../../types';

export interface UseTaskMetricsLocalContext {
  models: DatatrakWebModelRegistry;
  projectId?: string;
}

const getTaskMetricsOnline = ({ projectId }: UseTaskMetricsLocalContext) =>
  get(`taskMetrics/${projectId}`);

export const useTaskMetrics = (projectId?: string) => {
  const isOfflineFirst = useIsOfflineFirst();
  return useDatabaseQuery<DatatrakWebTaskMetricsRequest.ResBody>(
    ['taskMetric', projectId],
    isOfflineFirst ? getTaskMetrics : getTaskMetricsOnline,
    {
      enabled: !!projectId,
      localContext: {
        projectId,
      },
    },
  );
};
