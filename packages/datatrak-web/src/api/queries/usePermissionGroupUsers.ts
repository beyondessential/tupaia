/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { Country, DatatrakWebUsersRequest, PermissionGroup } from '@tupaia/types';
import { get } from '../api';

export const usePermissionGroupUsers = (
  countryCode?: Country['code'],
  permissionGroupName?: PermissionGroup['name'],
  searchTerm?: string,
) => {
  return useQuery(
    ['users', permissionGroupName, countryCode, searchTerm],
    (): Promise<DatatrakWebUsersRequest.ResBody> =>
      get(`users/${countryCode}`, {
        params: {
          searchTerm,
          permissionGroupName,
        },
      }),
    {
      enabled: !!permissionGroupName && !!countryCode,
    },
  );
};
