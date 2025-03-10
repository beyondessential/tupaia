import { useQuery } from '@tanstack/react-query';
import { ProjectCountryAccessListRequest } from '@tupaia/types';
import { get } from '../api';
import { ProjectCode } from '../../types';

export const useProjectCountryAccessList = (projectCode: ProjectCode) => {
  return useQuery(
    ['me/countries', projectCode],
    (): Promise<ProjectCountryAccessListRequest.ResBody> =>
      get(`me/countries`, { params: { projectCode } }),
    {
      placeholderData: [],
      enabled: !!projectCode,
      staleTime: 0, // Disable cache so that if we go back to the request access view, the country list is up to date
    },
  );
};
