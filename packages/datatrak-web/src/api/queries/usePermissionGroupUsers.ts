import { useQuery } from '@tanstack/react-query';
import { Country, DatatrakWebUsersRequest, PermissionGroup } from '@tupaia/types';
import { get } from '../api';

export const usePermissionGroupUsers = (
  countryCode?: Country['code'],
  permissionGroupId?: PermissionGroup['id'],
  searchTerm?: string,
) => {
  return useQuery<DatatrakWebUsersRequest.ResBody>(
    ['users', permissionGroupId, countryCode, searchTerm],
    () =>
      get(`users/${countryCode}`, {
        params: {
          searchTerm,
          permissionGroupId,
        },
      }),
    {
      enabled: !!permissionGroupId && !!countryCode,
    },
  );
};
