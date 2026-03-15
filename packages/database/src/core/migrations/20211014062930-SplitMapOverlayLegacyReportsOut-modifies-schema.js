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
  await db.runSql(`
    UPDATE map_overlay
    SET "measureBuilderConfig" = "measureBuilderConfig" || ('{"dataElementCode": "' || "dataElementCode" || '" }')::jsonb
    WHERE "dataElementCode" <> 'value';
  `);
  await db.runSql(`
    UPDATE map_overlay
    SET report_code = id || '_map'
    WHERE legacy = true;
  `);
  await db.runSql(`
    INSERT INTO legacy_report (id, code, data_builder, data_builder_config, data_services)
    SELECT generate_object_id(), id || '_map', "measureBuilder", "measureBuilderConfig", data_services
    FROM map_overlay;
  `);
  await db.runSql('ALTER TABLE map_overlay DROP COLUMN "measureBuilder";');
  await db.runSql('ALTER TABLE map_overlay DROP COLUMN "measureBuilderConfig";');
  await db.runSql('ALTER TABLE map_overlay DROP COLUMN "dataElementCode";');
  await db.runSql('ALTER TABLE map_overlay RENAME COLUMN id TO code;');
  await db.runSql(
    'ALTER TABLE map_overlay ADD COLUMN id TEXT PRIMARY KEY DEFAULT generate_object_id();',
  );
};

exports.down = async function (db) {
  await db.runSql('ALTER TABLE map_overlay ADD COLUMN "measureBuilder" text;');
  await db.runSql('ALTER TABLE map_overlay ADD COLUMN "measureBuilderConfig" jsonb;');
  await db.runSql('ALTER TABLE map_overlay ADD COLUMN "dataElementCode" text;');
  await db.runSql(`
    UPDATE map_overlay
    SET
      "measureBuilder" = legacy_report.data_builder,
      "measureBuilderConfig" = legacy_report.data_builder_config,
      "dataElementCode" = legacy_report.data_builder_config->'dataElementCode'
    FROM legacy_report
    WHERE legacy_report.code = map_overlay.report_code;
  `);
  await db.runSql(`
    UPDATE map_overlay
    SET "dataElementCode" = "value"
    WHERE "dataElementCode" IS NULL;
  `);
  await db.runSql(`
    UPDATE map_overlay
    SET "measureBuilderConfig" = "measureBuilderConfig" - 'dataElementCode'
    WHERE id NOT IN ('LAOS_EOC_Dengue_Cases_By_Week_District', 'LA_EOC_Dengue_Cases_By_Week'); -- two cases that did have a dataElementCode prior to up
  `);
  await db.runSql(`
    DELETE FROM legacy_report
    WHERE code like '%_map;
  `);
  await db.runSql('ALTER TABLE map_overlay DROP COLUMN id;');
  await db.runSql('ALTER TABLE map_overlay RENAME COLUMN code TO id;');
  await db.runSql(`
    UPDATE map_overlay
    SET report_code = NULL
    WHERE legacy = true;
  `);
};

exports._meta = {
  version: 1,
};
