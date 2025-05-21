import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { Project, DatatrakWebUsersRequest } from '@tupaia/types';
import { get } from '../api';

export const useProjectUsersQuery = (
  projectCode?: Project['code'],
  searchTerm?: string,
  useQueryOptions?: UseQueryOptions<DatatrakWebUsersRequest.ResBody>,
) => {
  return useQuery<DatatrakWebUsersRequest.ResBody>(
    ['projectUsers', projectCode, searchTerm],
    () =>
      get(`project/${projectCode}/users`, {
        params: { searchTerm },
      }),
    {
      ...useQueryOptions,
      enabled: !!projectCode && useQueryOptions?.enabled,
    },
  );
};
