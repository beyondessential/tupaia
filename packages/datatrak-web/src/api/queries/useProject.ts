import { ensure } from '@tupaia/tsutils';
import type { WebServerProjectRequest } from '@tupaia/types';
import { useOnlineQuery } from './useOnlineQuery';
import { get } from '../api';

export const useProject = (projectCode?: string) => {
  return useOnlineQuery<WebServerProjectRequest.ResBody>(
    ['project', projectCode],
    async () =>
      await get(
        `project/${encodeURIComponent(ensure(projectCode, `useProject query function called with ${projectCode} projectCode`))}`,
      ),
    { enabled: Boolean(projectCode) },
  );
};
