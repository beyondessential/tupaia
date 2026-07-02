import { uniq } from 'es-toolkit';

const fetchPermissionGroupChildren = async (models, permissionGroupName) => {
  const permissionGroup = await models.permissionGroup.findOne({ name: permissionGroupName });
  const children = await permissionGroup.getChildTree();
  return children.map(c => c.name);
};

/**
 * Builds a user's access policy in the format
 * { entityCode1: ['permissionGroup1', 'permissionGroup2'], entityCode2: ['permissionGroup1'] }
 */
export const buildAccessPolicy = async (models, userId) => {
  const permissionsByEntity = {};
  const userEntityPermissions = await models.userEntityPermission.find({ user_id: userId });

  // set up permission group children fetching, for flattening the permission hierarchy
  // cache the promise (rather than the resolved value) so that concurrent lookups for the same
  // permission group share a single db fetch
  const permissionGroupToChildren = {};
  const getOrFetchPermissionGroupChildren = permissionGroupName => {
    if (!permissionGroupToChildren[permissionGroupName]) {
      permissionGroupToChildren[permissionGroupName] = fetchPermissionGroupChildren(
        models,
        permissionGroupName,
      );
    }
    return permissionGroupToChildren[permissionGroupName];
  };

  // iterate through the user's permissions and build the permission groups per entity
  await Promise.all(
    userEntityPermissions.map(async userEntityPermission => {
      const { permission_group_name: permissionGroupName, entity_code: entityCode } =
        userEntityPermission;

      permissionsByEntity[entityCode] = permissionsByEntity[entityCode] || [];
      permissionsByEntity[entityCode].push(permissionGroupName);

      // get all of the permission groups below this one in the hierarchy, as the user also has
      // implied access for them, so they'll also be added to the access policy (which has a simple,
      // flat structure, ignorant of the fact that permission groups exist in a hierarchy)
      const permissionGroupChildren = await getOrFetchPermissionGroupChildren(permissionGroupName);
      permissionsByEntity[entityCode] =
        permissionsByEntity[entityCode].concat(permissionGroupChildren);
    }),
  );

  // policy is simply the permissions by entity, but de-duplicated
  const policy = {};
  Object.entries(permissionsByEntity).forEach(([entityCode, permissionGroups]) => {
    policy[entityCode] = uniq(permissionGroups);
  });
  return policy;
};
