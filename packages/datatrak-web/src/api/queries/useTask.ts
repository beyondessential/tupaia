import { useQuery } from '@tanstack/react-query';
import { DatatrakWebTaskRequest } from '@tupaia/types';
import { get } from '../api';

export const useTask = (taskId?: string) => {
  return useQuery(
    ['tasks', taskId],
    (): Promise<DatatrakWebTaskRequest.ResBody> => get(`tasks/${taskId}`),
    {
      enabled: !!taskId,
    },
  );
};
