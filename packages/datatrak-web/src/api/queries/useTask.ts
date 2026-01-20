import { DatatrakWebTaskRequest } from '@tupaia/types';
import { getTask } from '../../database';
import { DatatrakWebModelRegistry } from '../../types';
import { get } from '../api';
import { useIsOfflineFirst } from '../offlineFirst';
import { useDatabaseQuery } from './useDatabaseQuery';

export interface UseTaskLocalContext {
  models: DatatrakWebModelRegistry;
  taskId?: string;
}

const getTaskOnline = async ({ taskId }: UseTaskLocalContext) => {
  if (!taskId) return null;
  return await get(`tasks/${encodeURIComponent(taskId)}`);
};

export const useTask = (taskId?: string) => {
  const isOfflineFirst = useIsOfflineFirst();
  return useDatabaseQuery<DatatrakWebTaskRequest.ResBody>(
    ['tasks', taskId],
    isOfflineFirst ? getTask : getTaskOnline,
    {
      localContext: { taskId },
      enabled: Boolean(taskId),
    },
  );
};
