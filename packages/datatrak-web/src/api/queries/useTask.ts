import { DatatrakWebTaskRequest } from '@tupaia/types';
import { getTask } from '../../database';
import { DatatrakWebModelRegistry } from '../../types';
import { get } from '../api';
import { useIsOfflineFirst } from '../offlineFirst';
import { ContextualQueryFunctionContext, useDatabaseQuery } from './useDatabaseQuery';

export interface UseTaskLocalContext extends ContextualQueryFunctionContext {
  models: DatatrakWebModelRegistry;
  taskId?: string;
}

const getTaskOnline = async ({ taskId }: UseTaskLocalContext) => get(`tasks/${taskId}`);

export const useTask = (taskId?: string) => {
  const isOfflineFirst = useIsOfflineFirst();
  return useDatabaseQuery<DatatrakWebTaskRequest.ResBody>(
    ['tasks', taskId],
    isOfflineFirst ? getTask : getTaskOnline,
    {
      localContext: {
        taskId,
      },
      enabled: !!taskId,
    },
  );
};
