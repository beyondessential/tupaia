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

const REPORT_ID = 'UNFPA_RH_Contraceptives_Offered';
const NEW_DATA_BUILDER = 'booleanValueByDataElements';
const NEW_DATA_BUILDER_CONFIG = {
  dataElementToString: {
    RHS6UNFPA1355: 'Does this facility have at least five methods of contraception?',
    RHS6UNFPA1354: 'Does this facility have at least three methods of contraception?',
  },
};
const OLD_DATA_BUILDER = 'sumLatestPerMetric';
const OLD_DATA_BUILDER_CONFIG = {
  dataElementCodes: ['RHS6UNFPA1355', 'RHS6UNFPA1354'],
};

exports.up = async function (db) {
  await db.runSql(`
    UPDATE "dashboardReport"
    SET "dataBuilder" = '${NEW_DATA_BUILDER}',
    "dataBuilderConfig" = '${JSON.stringify(NEW_DATA_BUILDER_CONFIG)}'
    WHERE id = '${REPORT_ID}'
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    UPDATE "dashboardReport"
    SET "dataBuilder" = '${OLD_DATA_BUILDER}',
    "dataBuilderConfig" = '${JSON.stringify(OLD_DATA_BUILDER_CONFIG)}'
    WHERE id = '${REPORT_ID}'
  `);
};

exports._meta = {
  version: 1,
};
