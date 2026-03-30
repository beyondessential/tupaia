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

const DATA_BUILDER_CONFIG = {
  new: {
    dataClasses: {
      value: {
        numerator: { dataValues: { STR_CRF169: { value: 'Positive', operator: 'regex' } } },
        denominator: { dataValues: { STR_CRF165: '1' } },
      },
    },
    programCode: 'SCRF',
  },
  old: {
    dataClasses: {
      mRDT: {
        numerator: { dataValues: { STR_CRF169: { value: 'Positive', operator: 'regex' } } },
        denominator: { dataValues: { STR_CRF165: '1' } },
      },
    },
    programCode: 'SCRF',
  },
};

const REPORT_ID = 'PG_Strive_PNG_Weekly_mRDT_Positive';

const updateDataBuilderConfig = (db, config) =>
  db.runSql(
    `UPDATE "dashboardReport" SET "dataBuilderConfig" = '${JSON.stringify(
      config,
    )}' WHERE id = '${REPORT_ID}'`,
  );

exports.up = async function (db) {
  return updateDataBuilderConfig(db, DATA_BUILDER_CONFIG.new);
};

exports.down = function (db) {
  return updateDataBuilderConfig(db, DATA_BUILDER_CONFIG.old);
};

exports._meta = {
  version: 1,
};
