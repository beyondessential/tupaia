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

exports.up = function(db, callback) {
  const rejectOnError = (resolve, reject, error) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  };
  Promise.all([
    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'dataBuilderConfig', 'viewJson'],
        [
          'Disaster_Response_Basic_Indicators',
          'latestMultiDataElement',
          `{
        "apiRoute": "analytics",
        "dataElementCodes": [ "DP_NEW004", "DP_NEW003", "FF7" ]
      }`,
          `{
        "type": "view",
        "name": "Normal Facility Data",
        "viewType": "multiValue"
      }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    db.runSql(`
      UPDATE "dashboardGroup" SET "dashboardReports" = "dashboardReports" || '{"Disaster_Response_Basic_Indicators"}' WHERE name = 'Disaster Response' AND "organisationLevel" = 'Facility';
    `),
  ]).then(() => callback());
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
