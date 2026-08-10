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

/**
 * Columns that have always been foreign keys in practice, but were never enforced.
 *
 * Server only: none of the referencing tables below (map_overlay,
 * data_element_data_service, data_service_sync_group) exist in the DataTrak web browser
 * database. The one constraint from this set that does apply there, project.entity_id ->
 * entity.id, is in the companion migration 20260807113400-AddSyncedTablesMissingFKConstraints.
 *
 * Only references that a data audit found to be already clean are added here. Still
 * outstanding, each needing a data clean-up or a schema change of its own:
 *   - data_service_entity.entity_code -> entity.code
 *   - sync_group_log.sync_group_code -> data_service_sync_group.code
 *   - entity.country_code -> entity.code
 *   - dashboard_item.report_code and map_overlay.report_code, which point at report.code
 *     when legacy = false and legacy_report.code when legacy = true, and so cannot be
 *     expressed as a single foreign key
 *
 * ON UPDATE CASCADE throughout, because the code/name columns referenced below are
 * editable in the admin panel and renames need to propagate. ON DELETE RESTRICT
 * throughout, so that deleting a referenced row fails loudly rather than silently
 * discarding the referencing configuration.
 */
exports.up = async function (db) {
  await db.runSql(`
    ALTER TABLE map_overlay
      ADD CONSTRAINT map_overlay_permission_group_fkey
      FOREIGN KEY (permission_group) REFERENCES permission_group(name)
      ON UPDATE CASCADE ON DELETE RESTRICT;
    ALTER TABLE data_element_data_service
      ADD CONSTRAINT data_element_data_service_data_element_code_fkey
      FOREIGN KEY (data_element_code) REFERENCES data_element(code)
      ON UPDATE CASCADE ON DELETE RESTRICT;
    ALTER TABLE data_element_data_service
      ADD CONSTRAINT data_element_data_service_country_code_fkey
      FOREIGN KEY (country_code) REFERENCES entity(code)
      ON UPDATE CASCADE ON DELETE RESTRICT;
    ALTER TABLE data_service_sync_group
      ADD CONSTRAINT data_service_sync_group_data_group_code_fkey
      FOREIGN KEY (data_group_code) REFERENCES data_group(code)
      ON UPDATE CASCADE ON DELETE RESTRICT;
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    ALTER TABLE map_overlay
      DROP CONSTRAINT IF EXISTS map_overlay_permission_group_fkey;
    ALTER TABLE data_element_data_service
      DROP CONSTRAINT IF EXISTS data_element_data_service_data_element_code_fkey;
    ALTER TABLE data_element_data_service
      DROP CONSTRAINT IF EXISTS data_element_data_service_country_code_fkey;
    ALTER TABLE data_service_sync_group
      DROP CONSTRAINT IF EXISTS data_service_sync_group_data_group_code_fkey;
  `);
};

exports._meta = {
  version: 1,
  targets: ['server'],
};
