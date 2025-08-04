import { useMemo } from 'react';
import { useUser } from '../api/queries';

export const BES_ADMIN_PERMISSION_GROUP = 'BES Admin';
export const VIZ_BUILDER_PERMISSION_GROUP = 'Viz Builder User';

export function useUserPermissionGroups() {
  const { data: user, isFetched } = useUser();
  return useMemo(() => {
    if (!isFetched || !user /* Redundant, helps type inference */) return undefined;
    if (!user.accessPolicy) return new Set(); // Should never happen
    return new Set(Object.values(user.accessPolicy).flat());
  }, [user?.accessPolicy]);
}

/**
 * @param {string} permissionGroupName
 * @returns {boolean | undefined} `true` if the user has the {@link permissionGroupName} permission
 * group, `false` if they don’t, and `undefined` if the result is pending.
 */
export function useHasPermissionGroup(permissionGroupName) {
  const userPermissionGroups = useUserPermissionGroups();
  return userPermissionGroups?.has(permissionGroupName);
}

/**
 * @returns {boolean | undefined} `true` if the user has the {@link BES_ADMIN_PERMISSION_GROUP}
 * permission group, `false` if they don’t, and `undefined` if the result is pending.
 * @privateRemarks Assume that if a user has any BES Admin access, they are an internal user; and
 * short-circuit checking permissions for every country.
 */
export function useHasBesAdminAccess() {
  return useHasPermissionGroup(BES_ADMIN_PERMISSION_GROUP);
}

/**
 * @returns {boolean | undefined} `true` if the user has the {@link VIZ_BUILDER_PERMISSION_GROUP}
 * permission group, `false` if they don’t, and `undefined` if the result is pending.
 */
export function useHasVizBuilderAccess() {
  return useHasPermissionGroup(VIZ_BUILDER_PERMISSION_GROUP);
}
