import type { UseQueryOptions } from '@tanstack/react-query';
import type { DatatrakWebUsersRequest, Project } from '@tupaia/types';
import { useOnlineQuery } from './useOnlineQuery';
import { get } from '../api';

export const useProjectUsersQuery = (
  projectCode?: Project['code'],
  searchTerm?: string,
  useQueryOptions: UseQueryOptions<DatatrakWebUsersRequest.ResBody> = {},
) => {
  const { enabled = true, ...rest } = useQueryOptions;
  return useOnlineQuery<DatatrakWebUsersRequest.ResBody>(
    ['projectUsers', projectCode, searchTerm],
    async () =>
      await get(`project/${projectCode}/users`, {
        params: { searchTerm },
      }),
    {
      ...rest,
      enabled: enabled && !!projectCode,
    },
  );
};
