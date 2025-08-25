import { useQuery } from '@tanstack/react-query';
import { ProjectCountryAccessListRequest } from '@tupaia/types';
import { ProjectCode } from '../../types';
import { get } from '../api';

export const useProjectCountryAccessList = (projectCode: ProjectCode) => {
  return useQuery<ProjectCountryAccessListRequest.ResBody>(
    ['me/countries', projectCode],
    async () =>
      await get(`me/countries`, {
        params: { projectCode },
      }),
    {
      placeholderData: [],
      enabled: !!projectCode,
    },
  );
};
