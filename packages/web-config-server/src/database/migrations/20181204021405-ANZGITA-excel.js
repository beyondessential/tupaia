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

exports.up = function(db) {
  const rejectOnError = (resolve, reject, error) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  };
  return Promise.all([
    db.runSql(`
      UPDATE "dashboardGroup" SET "dashboardReports" = "dashboardReports" || '{"ANZGITA_Inventory_Raw"}' WHERE "name" = 'ANZGITA';
    `),
    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'dataBuilderConfig', 'isDataRegional'],
        [
          'ANZGITA_Inventory_Raw',
          'actualMonthlyValuesVsIdeal',
          `{
        "name": "Historical Comparison",
        "type": "chart",
        "chartType": "matrix",
        "periodGranularity": "month"
      }`,
          `{
        "pairs": {
          "FIJIINV005": "ANZIDEAL003",
          "FIJIINV008": "ANZIDEAL005",
          "FIJIINV011": "ANZIDEAL007",
          "FIJIINV014": "ANZIDEAL009",
          "FIJIINV017": "ANZIDEAL012",
          "FIJIINV020": "ANZIDEAL014",
          "FIJIINV023": "ANZIDEAL016",
          "FIJIINV026": "ANZIDEAL018",
          "FIJIINV029": "ANZIDEAL020",
          "FIJIINV032": "ANZIDEAL022",
          "FIJIINV035": "ANZIDEAL024",
          "FIJIINV038": "ANZIDEAL026",
          "FIJIINV041": "ANZIDEAL028",
          "FIJIINV044": "ANZIDEAL030",
          "FIJIINV047": "ANZIDEAL032",
          "FIJIINV050": "ANZIDEAL034",
          "FIJIINV053": "ANZIDEAL036",
          "FIJIINV056": "ANZIDEAL038",
          "FIJIINV059": "ANZIDEAL040",
          "FIJIINV068": "ANZIDEAL042",
          "FIJIINV071": "ANZIDEAL044", 
          "FIJIINV074": "ANZIDEAL046"
        },
        "labelRegex": "(?<=Endoscopy inventory: )(.*)(?= \\\\(Ideal inventory\\\\))",
        "isDenominatorAnnual": false,
        "includeAggregateLine": true
      }`,
          true,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
  ]);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
