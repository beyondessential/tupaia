import { DatatrakWebTaskRequest } from '@tupaia/types';

import { get } from '../api';
import { useIsOfflineFirst } from '../offlineFirst';
import { getTask } from '../../database';
import { LocalContext, useDatabaseQuery } from './useDatabaseQuery';
import { DatatrakWebModelRegistry } from '../../types';

export interface UseTaskLocalContext extends LocalContext {
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
