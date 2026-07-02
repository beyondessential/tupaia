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
  console.time('buildAccessPolicy');
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
  console.timeEnd('buildAccessPolicy');
  console.log(policy ?? {});
  return policy ?? {};
};
