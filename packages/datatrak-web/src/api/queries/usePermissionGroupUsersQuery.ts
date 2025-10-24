import { ensure } from '@tupaia/tsutils';
import { Country, DatatrakWebUsersRequest, PermissionGroup } from '@tupaia/types';
import { get } from '../api';
import { useIsOfflineFirst } from '../offlineFirst';
import { ContextualQueryFunctionContext, useDatabaseQuery } from './useDatabaseQuery';

interface UsePermissionGroupUsersQueryParams {
  countryCode?: Country['code'];
  permissionGroupId?: PermissionGroup['id'];
  searchTerm?: string;
}

interface PermissionGroupUsersQueryFunctionContext
  extends UsePermissionGroupUsersQueryParams,
    ContextualQueryFunctionContext {}

const getRemote = async ({
  countryCode,
  permissionGroupId,
  searchTerm,
}: PermissionGroupUsersQueryFunctionContext) => {
  if (!permissionGroupId || !countryCode) return [];
  return await get(`users/${encodeURIComponent(countryCode)}`, {
    params: { searchTerm, permissionGroupId },
  });
};

const getLocal = async ({
  models,
  countryCode,
  permissionGroupId,
  searchTerm,
}: PermissionGroupUsersQueryFunctionContext) => {
  if (!permissionGroupId || !countryCode) return [];
  const permissionGroup = ensure(
    await models.permissionGroup.findById(permissionGroupId),
    `No permission group exists with ID ${permissionGroupId}`,
  );
  return await models.user.getFilteredUsersForPermissionGroup(
    countryCode,
    permissionGroup,
    searchTerm,
  );
};

export const usePermissionGroupUsersQuery = ({
  countryCode,
  permissionGroupId,
  searchTerm,
}: UsePermissionGroupUsersQueryParams) => {
  const isOfflineFirst = useIsOfflineFirst();

  return useDatabaseQuery<DatatrakWebUsersRequest.ResBody>(
    ['users', permissionGroupId, countryCode, searchTerm],
    isOfflineFirst ? getLocal : getRemote,
    {
      enabled: !!permissionGroupId && !!countryCode,
      localContext: {
        countryCode,
        permissionGroupId,
        searchTerm,
      },
    },
  );
};
