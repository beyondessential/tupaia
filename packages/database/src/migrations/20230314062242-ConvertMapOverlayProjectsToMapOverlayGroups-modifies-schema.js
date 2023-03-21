'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  // Step 1: Update map_overlay_group so that no existing groups have project codes
  await db.runSql(`
    UPDATE map_overlay_group 
    SET code = code || '_root'
    WHERE code in (select code from project);
  `);

  // Step 2: Add map_overlay_group for each project
  await db.runSql(`
    INSERT INTO map_overlay_group (id, name, code)
    (SELECT generate_object_id(), code as name, code as code FROM project);
  `);

  // Step 3: For each map overlay, add its highest group parent to all its projects' roots
  const mapOverlays = (
    await db.runSql(`
    WITH RECURSIVE nested_map_overlay_group_relation AS (
      SELECT
        mogr.map_overlay_group_id,
        mogr.child_id,
        mogr.child_type,
        1 as depth,
        mog.id as parent,
        mo.project_codes as all_project_codes
      FROM
        map_overlay_group_relation mogr
      join map_overlay_group mog on mogr.map_overlay_group_id = mog.id
      left join map_overlay mo on mogr.child_id = mo.id
      UNION
        SELECT
          sub_mogr.map_overlay_group_id,
          sub_mogr.child_id,
          sub_mogr.child_type,
          depth + 1 as depth,
          parent,
          all_project_codes
        FROM
          map_overlay_group_relation sub_mogr
        join map_overlay_group mog2 on sub_mogr.map_overlay_group_id = mog2.id
        left join map_overlay mo2 on sub_mogr.child_id = mo2.id
        INNER JOIN nested_map_overlay_group_relation nmogr ON nmogr.child_id = sub_mogr.map_overlay_group_id
    ) select
        mo.id,
        array_agg(parent order by depth desc) as parents,
        mo.project_codes 
    from nested_map_overlay_group_relation nmogr
    join map_overlay mo on nmogr.child_id = mo.id
    where child_type = 'mapOverlay'
    group by mo.id, mo.project_codes
  `)
  ).rows;

  const projectMapOverlayGroups = (
    await db.runSql(
      'SELECT mog.id, mog.name FROM map_overlay_group mog JOIN project p ON mog.name = p.code',
    )
  ).rows;

  for (let i = 0; i < mapOverlays.length; i++) {
    const { parents, project_codes: projectCodes } = mapOverlays[i];
    const topLevelParent = parents[1]; // Root is always the absolute top

    for (let j = 0; j < projectCodes.length; j++) {
      const projectMapOverlayGroup = projectMapOverlayGroups.find(
        ({ name }) => name === projectCodes[j],
      );

      if (!projectMapOverlayGroup) {
        continue; // The project may not be present in the test database
      }

      const existingRelation = (
        await db.runSql(
          'SELECT * FROM map_overlay_group_relation WHERE map_overlay_group_id = ? AND child_id = ?',
          [projectMapOverlayGroup.id, topLevelParent],
        )
      ).rows;

      if (existingRelation.length > 0) {
        // relation exists, exit early
        continue;
      }

      await db.runSql(
        `
        INSERT INTO map_overlay_group_relation (id, map_overlay_group_id, child_id, child_type)
        VALUES(generate_object_id(), ?, ?, 'mapOverlayGroup')
      `,
        [projectMapOverlayGroup.id, topLevelParent],
      );
    }
  }

  // Step 4: Remove project_codes column from map_overlay
  await db.runSql(`
    ALTER TABLE map_overlay DROP COLUMN project_codes;
  `);

  // Step 5: Remove Root map overlay group and relations
  await db.runSql(
    `DELETE FROM map_overlay_group_relation WHERE map_overlay_group_id IN (SELECT id FROM map_overlay_group WHERE name = 'Root');`,
  );

  await db.runSql(
    `DELETE FROM map_overlay_group WHERE id IN (SELECT id FROM map_overlay_group WHERE name = 'Root');`,
  );
};

exports.down = async function () {
  return null;
};

exports._meta = {
  version: 1,
};
