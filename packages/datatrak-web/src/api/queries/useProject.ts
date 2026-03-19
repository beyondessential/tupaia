import { useQuery } from '@tanstack/react-query';

import { ensure } from '@tupaia/tsutils';
import { WebServerProjectRequest } from '@tupaia/types';
import { get } from '../api';

export const useProject = (projectCode?: string) => {
  return useQuery<WebServerProjectRequest.ResBody>(
    ['project', projectCode],
    async () =>
      await get(
        `project/${encodeURIComponent(ensure(projectCode, `useProject query function called with ${projectCode} projectCode`))}`,
      ),
    { enabled: window.navigator.onLine && Boolean(projectCode) },
  );
};
