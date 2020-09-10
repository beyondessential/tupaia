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

const config = {
  columns: {
    CD3a_003: {},
    CD3a_006: {},
    CD3a_007: {
      sortOrder: 1,
    },
    $eventOrgUnitName: {
      title: 'Village',
      sortOrder: 1,
    },
  },
  programCode: 'CD3a',
  stripFromColumnNames: 'CD3a ',
};

exports.up = function(db) {
  return db.runSql(`
  update "dashboardReport"
  set "dataBuilderConfig" = '${JSON.stringify(config)}'
  where "id" = 'TO_CD_Validation_CD3'
  and "drillDownLevel" != '1';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
