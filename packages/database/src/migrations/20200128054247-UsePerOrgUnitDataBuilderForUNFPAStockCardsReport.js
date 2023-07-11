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

exports.up = function (db) {
  return db.runSql(`
    UPDATE "dashboardReport"
      SET "dataBuilderConfig" = '{"dataClasses": {"Number of facilities using stock cards for RH commodities": {"numerator": {"dataValues": {"RHS6UNFPA1210": 1, "RHS6UNFPA1223": 1, "RHS6UNFPA1236": 1, "RHS6UNFPA1249": 1, "RHS6UNFPA1262": 1, "RHS6UNFPA1275": 1, "RHS6UNFPA1288": 1, "RHS6UNFPA1301": 1}}, "denominator": "$orgUnitCount"}, "Number of facilities with updated stock cards for RH commodities": {"numerator": {"dataValues": {"RHS6UNFPA1211": 1, "RHS6UNFPA1224": 1, "RHS6UNFPA1237": 1, "RHS6UNFPA1250": 1, "RHS6UNFPA1263": 1, "RHS6UNFPA1276": 1, "RHS6UNFPA1289": 1, "RHS6UNFPA1302": 1}}, "denominator": "$orgUnitCount"}}}'
        WHERE "id" = 'UNFPA_RH_Stock_Cards';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE "dashboardReport"
      SET "dataBuilderConfig" = '{"dataClasses": {"Number of facilities using stock cards for RH commodities": {"numerator": {"dataValues": {"RHS6UNFPA1210": 1, "RHS6UNFPA1223": 1, "RHS6UNFPA1236": 1, "RHS6UNFPA1249": 1, "RHS6UNFPA1262": 1, "RHS6UNFPA1275": 1, "RHS6UNFPA1288": 1, "RHS6UNFPA1301": 1}}, "denominator": {"dataValues": {"RHS6UNFPA1210": "*", "RHS6UNFPA1223": "*", "RHS6UNFPA1236": "*", "RHS6UNFPA1249": "*", "RHS6UNFPA1262": "*", "RHS6UNFPA1275": "*", "RHS6UNFPA1288": "*", "RHS6UNFPA1301": "*"}}}, "Number of facilities with updated stock cards for RH commodities": {"numerator": {"dataValues": {"RHS6UNFPA1211": 1, "RHS6UNFPA1224": 1, "RHS6UNFPA1237": 1, "RHS6UNFPA1250": 1, "RHS6UNFPA1263": 1, "RHS6UNFPA1276": 1, "RHS6UNFPA1289": 1, "RHS6UNFPA1302": 1}}, "denominator": {"dataValues": {"RHS6UNFPA1211": "*", "RHS6UNFPA1224": "*", "RHS6UNFPA1237": "*", "RHS6UNFPA1250": "*", "RHS6UNFPA1263": "*", "RHS6UNFPA1276": "*", "RHS6UNFPA1289": "*", "RHS6UNFPA1302": "*"}}}}}'
        WHERE "id" = 'UNFPA_RH_Stock_Cards';
  `);
};

exports._meta = {
  version: 1,
};
