import { useQuery } from '@tanstack/react-query';
import { Project, DatatrakWebUsersRequest } from '@tupaia/types';
import { get } from '../api';

export const useProjectUsers = (projectCode?: Project['code'], searchTerm?: string) => {
  return useQuery(
    ['projectUsers', projectCode, searchTerm],
    (): Promise<DatatrakWebUsersRequest.ResBody> =>
      get(`project/${projectCode}/users`, {
        params: {
          searchTerm,
        },
      }),
    {
      enabled: !!projectCode,
    },
  );
};
