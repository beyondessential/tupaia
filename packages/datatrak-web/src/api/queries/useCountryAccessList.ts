import { useQuery } from '@tanstack/react-query';
import { Project, ProjectCountryAccessListRequest } from '@tupaia/types';
import { get } from '../api';
import { useCurrentUserContext } from '..';

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
