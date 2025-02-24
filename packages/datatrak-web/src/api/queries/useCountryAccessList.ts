import { useQuery } from '@tanstack/react-query';
import { Project, ProjectCountryAccessListRequest } from '@tupaia/types';
import { get } from '../api';
import { useCurrentUserContext } from '..';

/**
 * Returns the `UseQueryResult` for the countries the currently logged-in user has access to for the
 * given project. If no project code is provided, it defaults to the user’s current project.
 */
export const useCountryAccessList = (projectCode?: Project['code']) => {
  const user = useCurrentUserContext();
  const code = projectCode ?? user?.project?.code;

  return useQuery<ProjectCountryAccessListRequest.ResBody>(
    ['me/countries', code],
    () =>
      get('me/countries', {
        params: { projectCode: code },
      }),
    {
      enabled: !!code,
      initialData: [] as ProjectCountryAccessListRequest.ResBody,
      placeholderData: [] as ProjectCountryAccessListRequest.ResBody,
      staleTime: 0, // Disable cache so that if we go back to the request access view, the country list is up to date
    },
  );
};
