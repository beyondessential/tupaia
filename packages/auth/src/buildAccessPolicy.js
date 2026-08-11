/**
 * @returns {Promise<Record<string, string[]>>}
 * @example
 * {
 *   entityCode1: ['leaf'],
 *   entityCode2: ['leaf', 'parent', 'grandparent']
 *   entityCode3: ['leaf', 'parent']
 * }
 */
export const buildAccessPolicy = async (models, userId) => {
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

  return policy ?? {};
};
