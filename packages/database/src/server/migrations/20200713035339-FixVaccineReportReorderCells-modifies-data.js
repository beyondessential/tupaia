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

const REPORT_ID = 'Imms_FridgeVaccineCount';

const OLD_CELLS = [
  'PREAGGREGATED_DOSES_375874bf', // Doses of BCG vaccine
  'PREAGGREGATED_DOSES_44ec84bf', // Doses of Hepatitis B vaccine
  'PREAGGREGATED_DOSES_7191781d', // Doses of OPV vaccine
  'PREAGGREGATED_DOSES_6fc9d81d', // Doses of IPV vaccine
  'PREAGGREGATED_DOSES_cd2d581d', // Doses of MR vaccine
  'PREAGGREGATED_DOSES_4e6a681d', // Doses of TD vaccine
  'PREAGGREGATED_DOSES_40a8681d', // Doses of Pentavalent vaccine
  'PREAGGREGATED_DOSES_452a74bf', // Doses of HPV vaccine
  'PREAGGREGATED_DOSES_5e0d74bf', // Doses of TT vaccine (not used)
];

const NEW_CELLS = [
  'PREAGGREGATED_DOSES_375874bf', // Doses of BCG vaccine
  'PREAGGREGATED_DOSES_44ec84bf', // Doses of Hepatitis B vaccine
  'PREAGGREGATED_DOSES_452a74bf', // Doses of HPV vaccine
  'PREAGGREGATED_DOSES_6fc9d81d', // Doses of IPV vaccine
  'PREAGGREGATED_DOSES_cd2d581d', // Doses of MR vaccine
  'PREAGGREGATED_DOSES_7191781d', // Doses of OPV vaccine
  'PREAGGREGATED_DOSES_40a8681d', // Doses of Pentavalent vaccine
  'PREAGGREGATED_DOSES_4e6a681d', // Doses of TD vaccine
];

exports.up = function (db) {
  return db.runSql(`
    update "dashboardReport"
    set
      "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{cells}', '${JSON.stringify(
        NEW_CELLS,
      )}')
    where id = '${REPORT_ID}';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    update "dashboardReport"
    set
      "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{cells}', '${JSON.stringify(
        OLD_CELLS,
      )}')
    where id = '${REPORT_ID}';
  `);
};

exports._meta = {
  version: 1,
};
