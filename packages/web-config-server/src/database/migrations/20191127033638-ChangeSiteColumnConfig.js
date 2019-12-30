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

const oldColumn = {
  key: 'STR_CRF197',
  config: {
    title: 'Site',
  },
};
const newColumn = {
  key: 'STR_CRF197_entity',
  config: {
    title: 'Site',
    transformation: 'orgUnitCodeToName',
  },
};

exports.up = function(db) {
  return db.runSql(`
    UPDATE
      "dashboardReport"
    SET
      "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{columns,${
        newColumn.key
      }}', '${JSON.stringify(newColumn.config)}')
      #- '{columns,${oldColumn.key}}'
    WHERE
      id = 'PG_Strive_PNG_Case_Report_Form_Export';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE
      "dashboardReport"
    SET
      "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{columns,${
        oldColumn.key
      }}', '${JSON.stringify(oldColumn.config)}')
      #- '{columns,${newColumn.key}}'
    WHERE
      id = 'PG_Strive_PNG_Case_Report_Form_Export';
  `);
};

exports._meta = {
  version: 1,
};
