'use strict';

import { arrayToDbString } from '../utilities';

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

const IMMS_DASHBOARDS = ['imms_Immunization_Module', 'SB_Immunisation', 'VU_Immunisation'];

const deleteDashboards = async (db, codes) => {
  const codeList = arrayToDbString(codes);

  await db.runSql(`
    DELETE FROM dashboard_relation dr
    USING dashboard d
    WHERE dr.dashboard_id =  d.id AND d.code IN (${codeList});
`);
  await db.runSql(`DELETE FROM dashboard WHERE code in (${codeList})`);
};

const deleteDashboardItemsByIds = async (db, ids) => {
  const idList = arrayToDbString(ids);

  await db.runSql(`
    DELETE FROM dashboard_relation dr
    USING dashboard_item di
    WHERE dr.child_id = di.id AND di.id IN (${idList});
`);
  await db.runSql(`
    DELETE FROM legacy_report lr
    USING dashboard_item di
    WHERE lr.code = di.code AND di.id IN (${idList});
`);
  await db.runSql(`DELETE FROM dashboard_item WHERE id IN (${idList})`);
};

const deleteMapOverlaysByIds = async (db, ids) => {
  const idList = arrayToDbString(ids);

  await db.runSql(`
    DELETE FROM map_overlay_group_relation mogr
    USING "mapOverlay" mo
    WHERE mogr.child_id = mo.id AND mo.id IN (${idList});
`);
  await db.runSql(`DELETE FROM "mapOverlay" WHERE id IN (${idList})`);
};

const deleteProjectAndHierarchy = async (db, code) => {
  const { rows } = await db.runSql(`SELECT * FROM project WHERE code = '${code}'`);
  const [{ id: projectId, entity_hierarchy_id: entityHierarchyId }] = rows;

  await db.runSql(`DELETE FROM access_request WHERE project_id = '${projectId}'`);
  await db.runSql(`DELETE FROM project WHERE code = '${code}'`);

  await db.runSql(
    `UPDATE dashboard_relation SET "project_codes" = array_remove("project_codes", 'imms')`,
  );
  await db.runSql(`UPDATE "mapOverlay" SET "projectCodes" = array_remove("projectCodes", 'imms')`);

  // turn off entity relation trigger as it would fire loads of notifications that we don't need
  // the notifications for deleting the root entity and hierarchy are enough
  await toggleEntityRelationTrigger(db, false);
  await db.runSql(
    `DELETE FROM ancestor_descendant_relation WHERE entity_hierarchy_id = '${entityHierarchyId}'`,
  );
  await db.runSql(`DELETE FROM entity_relation WHERE entity_hierarchy_id = '${entityHierarchyId}'`);
  await db.runSql(`DELETE FROM entity_hierarchy WHERE id = '${entityHierarchyId}'`);
  await db.runSql(`DELETE FROM entity WHERE code = '${code}'`);
  await toggleEntityRelationTrigger(db, true);
};

const toggleEntityRelationTrigger = async (db, enable) => {
  const action = enable ? 'ENABLE' : 'DISABLE';

  await db.runSql(`ALTER TABLE entity_relation ${action} TRIGGER entity_relation_trigger`);
};

const refreshProjectSortOrder = async db => {
  const { rows: projects } = await db.runSql(`
    SELECT * FROM project WHERE sort_order IS NOT NULL
    ORDER BY sort_order ASC`);

  for (const [i, project] of projects.entries()) {
    await db.runSql(`UPDATE PROJECT SET sort_order = ${i} WHERE id = '${project.id}'`);
  }
};

exports.up = async function (db) {
  await deleteDashboards(db, IMMS_DASHBOARDS);
  const { rows: immsDashboardItems } = await db.runSql(
    `SELECT * FROM dashboard_item WHERE code ILIKE 'Imms_%';`,
  );
  const immsDashboardItemIds = immsDashboardItems.map(di => di.id);
  await deleteDashboardItemsByIds(db, immsDashboardItemIds);

  const { rows: immsMapOverlays } = await db.runSql(`
      SELECT * FROM "mapOverlay"
      WHERE "projectCodes" IN ('{imms,explore}')`);
  const immsMapOverlayIds = immsMapOverlays.map(di => di.id);
  await deleteMapOverlaysByIds(db, immsMapOverlayIds);

  await deleteProjectAndHierarchy(db, 'imms');
  await refreshProjectSortOrder(db);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
