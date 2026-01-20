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

const OLD_DATA_BUILDER_CONFIG = {
  columns: {
    HP30: {},
    HP31: {
      additionalData: ['HP32', 'HP33', 'HP34'],
    },
    $eventOrgUnitName: {
      title: 'Village',
      sortOrder: 1,
    },
  },
  programCode: 'HP02',
  stripFromColumnNames: 'HP02 NCD Risk Factor: ',
};

const NEW_DATA_BUILDER_CONFIG = {
  columns: {
    HP30n: {},
    HP31n: {
      additionalData: ['HP32n', 'HP33n', 'HP34n'],
    },
    $eventOrgUnitName: {
      title: 'Village',
      sortOrder: 1,
    },
  },
  programCode: 'HP02',
  stripFromColumnNames: 'HP NCD Risk Factor Screening: ',
};

const REPORT_ID = 'TO_HPU_Validation_HP_02';

exports.up = function (db) {
  return db.runSql(`
    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = '${JSON.stringify(NEW_DATA_BUILDER_CONFIG)}'
    WHERE id = '${REPORT_ID}'
    AND "drillDownLevel" IS NULL;
  `);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = '${JSON.stringify(OLD_DATA_BUILDER_CONFIG)}'
    WHERE id = '${REPORT_ID}'
    AND "drillDownLevel" IS NULL;
  `);
};

exports._meta = {
  version: 1,
};
