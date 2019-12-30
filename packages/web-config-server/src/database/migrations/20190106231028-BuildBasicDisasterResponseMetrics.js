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
    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'dataBuilderConfig', 'isDataRegional'],
        [
          'disaster_response_basic_indicators',
          'comparableValuesByDisaster',
          `{
      "type": "view",
      "name": "Basic Disaster Response Indicators",
      "viewType": "multiValueRow",
      "presentationOptions": {
        "leftColumn": {
          "color": "#22c7fc", "label": "(normal)"
        },
        "rightColumn": {
          "color": "#db2222", "label": "(current)"
        }
      }
    }`,
          `{
      "apiRoute": "analytics",
      "dataElementCodes": [ "DP9", "DP_NEW002", "DP_NEW004", "DP_NEW006", "FF7" ],
      "comparisonElementCodes": [ "DP9" ]
    }`,
          true,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    db.runSql(`
    UPDATE "dashboardGroup"
    SET "dashboardReports" = '{8,31,9,30,35,34,32,disaster_response_basic_indicators}'
    WHERE id = '18';
  `),
  ]);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
