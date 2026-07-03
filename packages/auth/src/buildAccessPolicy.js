import { uniq, isEqual } from 'es-toolkit';

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
  console.time('buildAccessPolicy OLD');
  const permissionsByEntity = {};
  const userEntityPermissions = await models.userEntityPermission.find({ user_id: userId });

  // set up permission group children fetching, for flattening the permission hierarchy
  const permissionGroupToChildren = {};
  const getOrFetchPermissionGroupChildren = async permissionGroupName =>
    permissionGroupToChildren[permissionGroupName] || // get from cache
    fetchPermissionGroupChildren(models, permissionGroupName); // or fetch from db

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
  const policyOld = {};
  Object.entries(permissionsByEntity).forEach(([entityCode, permissionGroups]) => {
    policyOld[entityCode] = uniq(permissionGroups);
  });
  console.timeEnd('buildAccessPolicy OLD');

  console.time('buildAccessPolicy NEW');
  const [{ policy }] = await models.database.executeSql(
    `
      WITH RECURSIVE expanded_permissions AS (
        SELECT
          e.code AS entity_code,
          pg.id AS permission_group_id,
          pg.name AS permission_group_name
        FROM user_entity_permission uep
        JOIN entity e ON e.id = uep.entity_id
        JOIN permission_group pg ON pg.id = uep.permission_group_id
        WHERE uep.user_id = ?

        UNION

        SELECT
          ep.entity_code,
          child_pg.id AS permission_group_id,
          child_pg.name AS permission_group_name
        FROM expanded_permissions ep
        JOIN permission_group child_pg ON child_pg.parent_id = ep.permission_group_id
      )
      SELECT jsonb_object_agg(entity_code, permission_groups) AS policy
      FROM (
        SELECT
          entity_code,
          jsonb_agg(permission_group_name ORDER BY permission_group_name) AS permission_groups
        FROM (
          SELECT DISTINCT entity_code, permission_group_name
          FROM expanded_permissions
        ) deduped
        GROUP BY entity_code
      ) grouped;
    `,
    userId,
  );
  const policyNew = policy ?? {};
  console.timeEnd('buildAccessPolicy NEW');

  if (!isEqual(policyOld, policyNew)) {
    console.warn('Policy mismatch');
    console.warn('Old policy:', policyOld);
    console.warn('New policy:', policyNew);
  }

  return policyNew;
};
