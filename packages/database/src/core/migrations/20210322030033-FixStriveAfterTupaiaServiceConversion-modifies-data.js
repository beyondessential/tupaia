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

const deleteDhisSyncTableRecordsForStriveCases = async (db, table) =>
  db.runSql(`
    DELETE FROM ${table}
    USING survey_response sr
    JOIN survey s on s.id = sr.survey_id
    JOIN entity e on e.id = sr.entity_id
    WHERE
      sr.entity_id = ${table}.record_id AND
      s.code = 'SCRF' AND
      e.type = 'case';
`);

const cleanEntityDhisMetadataForStriveCases = async db => {
  await db.runSql(`ALTER TABLE entity DISABLE TRIGGER entity_trigger;`);

  await db.runSql(`
    UPDATE entity e SET metadata = e.metadata - 'dhis'
    FROM survey_response sr
    JOIN survey s on s.id = sr.survey_id
    WHERE
      e.id = sr.entity_id AND
      e.type = 'case' AND
      s.code = 'SCRF';
  `);

  await db.runSql(`ALTER TABLE entity ENABLE TRIGGER entity_trigger;`);
};

const updateStriveCaseReportFormExport = async db => {
  const id = 'PG_Strive_PNG_Case_Report_Form_Export';

  const { rows } = await db.runSql(`SELECT * FROM "dashboardReport" WHERE id = '${id}'`);
  const { dataBuilderConfig: config } = rows[0];
  config.columns.STR_CRF197_entity.transformation = 'entityIdToName'; // old: 'orgUnitCodeToName'
  config.dataElementCodes = ['STR_CRF167', 'STR_CRF197_entity']; // old: (undefined)

  await db.runSql(
    `UPDATE "dashboardReport" SET "dataBuilderConfig" = '${JSON.stringify(config)}'
    WHERE id = 'PG_Strive_PNG_Case_Report_Form_Export'`,
  );
};

exports.up = async function (db) {
  await updateStriveCaseReportFormExport(db);
  await deleteDhisSyncTableRecordsForStriveCases(db, 'dhis_sync_queue');
  await deleteDhisSyncTableRecordsForStriveCases(db, 'dhis_sync_log');
  await cleanEntityDhisMetadataForStriveCases(db);
};

exports.down = async function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
