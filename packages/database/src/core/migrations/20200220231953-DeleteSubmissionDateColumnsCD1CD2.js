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

const columnsToDelete = {
  TO_CD_Validation_CD1: 'CD2',
  TO_CD_Validation_CD2: 'CD2_2',
};

exports.up = function (db) {
  const sql = Object.entries(columnsToDelete)
    .map(
      ([reportId, columnKey]) => `
        UPDATE "dashboardReport"
        SET "dataBuilderConfig" = "dataBuilderConfig" #- '{columns,${columnKey}}'
        WHERE "id" = '${reportId}';
      `,
    )
    .join('\n');
  return db.runSql(sql);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
