import { uniq } from 'es-toolkit';

const fetchPermissionGroupChildren = async (models, permissionGroupName) => {
  const permissionGroup = await models.permissionGroup.findOne({ name: permissionGroupName });
  const children = await permissionGroup.getChildTree();
  return children.map(c => c.name);
};

/**
 * Legacy implementation retained for test comparison only.
 * @deprecated Will be removed once the SQL implementation is verified in production.
 */
export const buildAccessPolicyOld = async (models, userId) => {
  const permissionsByEntity = {};
  const userEntityPermissions = await models.userEntityPermission.find({ user_id: userId });

  const permissionGroupToChildren = {};
  const getOrFetchPermissionGroupChildren = async permissionGroupName =>
    permissionGroupToChildren[permissionGroupName] ||
    fetchPermissionGroupChildren(models, permissionGroupName);

  await Promise.all(
    userEntityPermissions.map(async userEntityPermission => {
      const { permission_group_name: permissionGroupName, entity_code: entityCode } =
        userEntityPermission;

      permissionsByEntity[entityCode] = permissionsByEntity[entityCode] || [];
      permissionsByEntity[entityCode].push(permissionGroupName);

      const permissionGroupChildren = await getOrFetchPermissionGroupChildren(permissionGroupName);
      permissionsByEntity[entityCode] =
        permissionsByEntity[entityCode].concat(permissionGroupChildren);
    }),
  );

  const policy = {};
  Object.entries(permissionsByEntity).forEach(([entityCode, permissionGroups]) => {
    policy[entityCode] = uniq(permissionGroups);
  });

  return policy;
};
