import { useQuery } from '@tanstack/react-query';
import { WebServerProjectRequest } from '@tupaia/types';
import { get } from '../api';

export const useProject = (projectCode?: string) => {
  return useQuery(
    ['project', projectCode],
    (): Promise<WebServerProjectRequest.ResBody> =>
      get(`project/${projectCode}`, {
        enabled: !!projectCode,
      }),
  );
};
