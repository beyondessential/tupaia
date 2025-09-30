/* Re-export for backward compatibility. Prefer importing directly from @tupaia/access-policy. */
export {
  allowNoPermissions,
  assertAllPermissions,
  assertAnyPermissions,
  hasBESAdminAccess,
  hasVizBuilderAccess,
  hasPermissionGroupAccess,
  hasPermissionGroupsAccess,
  hasSomePermissionGroupsAccess,
  assertBESAdminAccess,
  assertVizBuilderAccess,
  hasTupaiaAdminPanelAccess,
  hasTupaiaAdminPanelAccessToCountry,
  assertAdminPanelAccessToCountry,
  assertAdminPanelAccess,
  assertPermissionGroupAccess,
  assertPermissionGroupsAccess,
} from '@tupaia/access-policy';
