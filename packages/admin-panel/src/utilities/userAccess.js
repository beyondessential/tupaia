import { useUser } from '../api/queries';

const BES_ADMIN_PERMISSION_GROUP = 'BES Admin';
const VIZ_BUILDER_PERMISSION_GROUP = 'Viz Builder User';

/**
 * @param {string} permissionGroupName
 * @returns {boolean | undefined} `true` if the user has the {@link permissionGroupName} permission
 * group, `false` if they don’t, and `undefined` if the result is pending.
 */
export function useHasPermissionGroup(permissionGroupName) {
  const { data: user, isFetched } = useUser();
  if (!isFetched) return undefined;
  if (!user?.accessPolicy) return false; // Should never happen

  // Permission groups the current user has access to for any country
  const allPermissionGroups = new Set(Object.values(user.accessPolicy).flat());
  return allPermissionGroups.has(permissionGroupName);
}

/**
 * @returns {boolean | undefined} `true` if the user has the {@link BES_ADMIN_PERMISSION_GROUP}
 * permission group, `false` if they don’t, and `undefined` if the result is pending.
 * @privateRemarks You can assume that if a user has any BES Admin access, they are an internal
 * user; and short-circuit checking permissions for every country.
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
