/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from '@tanstack/react-query';
import { Country, DatatrakWebUsersRequest, PermissionGroup } from '@tupaia/types';
import { get } from '../api';

export const usePermissionGroupUsers = (
  countryCode?: Country['code'],
  permissionGroupId?: PermissionGroup['id'],
  searchTerm?: string,
) => {
  return useQuery(
    ['users', permissionGroupId, countryCode, searchTerm],
    (): Promise<DatatrakWebUsersRequest.ResBody> =>
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