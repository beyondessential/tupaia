'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const VILLAGE_COLUMN_TO_REPORT_ID = {
  CD6: 'TO_CD_Validation_CD1',
  CD2_3: 'TO_CD_Validation_CD2',
  CD3a_004: 'TO_CD_Validation_CD3',
  CD3b_005: 'TO_CD_Validation_CD3',
  CD4_004: 'TO_CD_Validation_CD4',
  CD93: 'TO_CD_Validation_CD8',
  HP2: 'TO_HPU_Validation_HP_01',
  HP29: 'TO_HPU_Validation_HP_02',
  HP238: 'TO_HPU_Validation_HP_05',
  HP279: 'TO_HPU_Validation_HP_07',
};

const replaceColumn = async (db, oldColumn, newColumn, extraFields, reportId) =>
  db.runSql(`
    UPDATE
      "dashboardReport"
    SET
      "dataBuilderConfig" = jsonb_set(
        "dataBuilderConfig",
        '{columns,${newColumn}}',
        jsonb_build_object(${extraFields.join(',')}) || 
          ("dataBuilderConfig"#>'{columns,${oldColumn}}')::jsonb
      ) #- '{columns,${oldColumn}}'
    WHERE
      id = '${reportId}' AND "dataBuilderConfig"->'columns' ? '${oldColumn}';
    `);

exports.up = async function(db) {
  return Object.entries(VILLAGE_COLUMN_TO_REPORT_ID).map(([villageColumn, reportId]) =>
    replaceColumn(
      db,
      villageColumn,
      '$eventOrgUnitName',
      ["'sortOrder'", '1', "'title'", "'Village'"],
      reportId,
    ),
  );
};

exports.down = async function(db) {
  // All columns except `CD93` were equal to {}
  // CD93 was { sortOrder: 2 }
  const { CD93, ...emptyVillageColumns } = VILLAGE_COLUMN_TO_REPORT_ID;

  await replaceColumn(
    db,
    'CD93',
    '$eventOrgUnitName',
    ["'sortOrder'", 2],
    VILLAGE_COLUMN_TO_REPORT_ID.CD93,
  );
  return Object.entries(emptyVillageColumns).map(([villageColumn, reportId]) =>
    replaceColumn(db, villageColumn, '$eventOrgUnitName', [], reportId),
  );
};

exports._meta = {
  version: 1,
};
