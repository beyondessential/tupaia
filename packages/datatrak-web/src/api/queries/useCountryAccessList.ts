import type { Project, ProjectCountryAccessListRequest } from '@tupaia/types';
import { useCurrentUserContext, useOnlineQuery } from '..';
import { get } from '../api';

/**
 * Returns the `UseQueryResult` for the countries the currently logged-in user has access to for the
 * given project. If no project code is provided, it defaults to the user’s current project.
 */
export const useCountryAccessList = (projectCode?: Project['code']) => {
  const user = useCurrentUserContext();
  const code = projectCode ?? user?.project?.code;

  return useOnlineQuery<ProjectCountryAccessListRequest.ResBody>(
    ['me/countries', code],
    async () =>
      await get('me/countries', {
        params: { projectCode: code },
      }),
    {
      enabled: !!code,
      placeholderData: [] as ProjectCountryAccessListRequest.ResBody,
    },
  );
};
