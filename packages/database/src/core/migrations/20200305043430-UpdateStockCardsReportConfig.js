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
    SET "dataBuilderConfig" = '{
      "dataClasses" : {
        "Number of facilities with updated stock cards for RH commodities" : {
          "numerator" : {
            "valueOfInterest" : 1,
            "compare" : "$count",
            "dataValues" : [
              [
                "RHS6UNFPA1206",
                "RHS6UNFPA1219",
                "RHS6UNFPA1232",
                "RHS6UNFPA1245",
                "RHS6UNFPA1258",
                "RHS6UNFPA1297"
              ],
              [
                "RHS6UNFPA1210",
                "RHS6UNFPA1223",
                "RHS6UNFPA1236",
                "RHS6UNFPA1249",
                "RHS6UNFPA1262",
                "RHS6UNFPA1301"
              ]
            ],
            "groupBy" : "organisationUnit"
          },
          "denominator" : "$orgUnitCount"
        },
        "Number of facilities using stock cards for RH commodities" : {
          "numerator" : {
            "valueOfInterest" : 1,
            "compare" : "$count",
            "dataValues" : [
              [
                "RHS6UNFPA1210",
                "RHS6UNFPA1223",
                "RHS6UNFPA1236",
                "RHS6UNFPA1249",
                "RHS6UNFPA1262",
                "RHS6UNFPA1301"
              ],
              [
                "RHS6UNFPA1211",
                "RHS6UNFPA1224",
                "RHS6UNFPA1237",
                "RHS6UNFPA1250",
                "RHS6UNFPA1263",
                "RHS6UNFPA1302"
              ]
            ],
            "groupBy" : "organisationUnit"
          },
          "denominator" : "$orgUnitCount"
        }
      }
    }' WHERE id = 'UNFPA_RH_Stock_Cards';
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
