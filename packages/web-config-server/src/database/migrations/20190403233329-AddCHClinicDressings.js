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
        ['id', 'dataBuilder', 'viewJson', 'dataBuilderConfig', 'isDataRegional'],
        [
          'TO_CH_Descriptive_ClinicDressings',
          'latestMultiDataElement',
          `{
      "type": "chart",
      "name": "Number of Clinic Dressings",
      "chartType": "bar"
    }`,
          `{
      "dataElementCodes": [ "CH324","CH325","CH326","CH327","CH328","CH329" ]
    }`,
          false,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `INSERT INTO "dashboardGroup" ("code", "organisationLevel", "userGroup", "organisationUnitCode", "name", "dashboardReports") VALUES ('Tonga_Community_Health_Country', 'Country','Tonga Community Health', 'TO', 'Community Health', '{"TO_CH_Descriptive_ClinicDressings"}')`,
        error => rejectOnError(resolve, reject, error),
      ),
    ),
  ]).then(() => callback());
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
