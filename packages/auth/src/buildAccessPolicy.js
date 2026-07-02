/**
 * @param {*} models
 * @param {string} permissionGroupName
 * @returns {Promise<Set<string>>}
 */
const fetchPermissionGroupChildren = async (models, permissionGroupName) => {
  const permissionGroup = await models.permissionGroup.findOne({ name: permissionGroupName });
  const children = await permissionGroup.getChildTree();
  return new Set(children.map(c => c.name));
};

/**
 * @param {*} models
 * @param {string} userId
 * @returns {Record<string, string[]>}
 * @example { entityCode1: ['permissionGroup1', 'permissionGroup2'], entityCode2: ['permissionGroup1'] }
 */
export const buildAccessPolicy = async (models, userId) => {
  /** @type {Map<string, Set<string>>} */
  const permissionsByEntity = new Map();
  const userEntityPermissions = await models.userEntityPermission.find({ user_id: userId });

  // set up permission group children fetching, for flattening the permission hierarchy
  // cache the promise (rather than the resolved value) so that concurrent lookups for the same
  // permission group share a single db fetch
  /** @type {Map<string, Promise<Set<string>>>} */
  const permissionGroupToChildren = new Map();
  /** @param {string} pgName */
  const getOrFetchPermissionGroupChildren = pgName => {
    if (!permissionGroupToChildren.has(pgName)) {
      permissionGroupToChildren.set(pgName, fetchPermissionGroupChildren(models, pgName));
    }
    return permissionGroupToChildren.get(pgName);
  };

  // iterate through the user's permissions and build the permission groups per entity
  await Promise.all(
    userEntityPermissions.map(async userEntityPermission => {
      /** @type {{ permission_group_name: string, entity_code: string }} */
      const { permission_group_name: permissionGroupName, entity_code: entityCode } =
        userEntityPermission;

      let permissionGroups = permissionsByEntity.get(entityCode);
      if (!permissionGroups) {
        permissionGroups = new Set();
        permissionsByEntity.set(entityCode, permissionGroups);
      }
      permissionGroups.add(permissionGroupName);

      // get all of the permission groups below this one in the hierarchy, as the user also has
      // implied access for them, so they'll also be added to the access policy (which has a simple,
      // flat structure, ignorant of the fact that permission groups exist in a hierarchy)
      const children = await getOrFetchPermissionGroupChildren(permissionGroupName);
      for (const child of children) permissionGroups.add(child);
    }),
  );

  /** @type {Record<string, string[]>} */
  const policy = {};
  for (const [entityCode, permissionGroups] of permissionsByEntity) {
    policy[entityCode] = Array.from(permissionGroups);
  }
  return policy;
};
