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
          'Disaster_Response_Infrastructure_Impact',
          'dataElementsOverTotalOperational',
          `{
        "dataElementCodes": [ "DP74H", "DP74J", "DP17", "DP18", "DP67", "DP71", "DP74A" ]
      }`,
          `{
        "type": "view",
        "name": "Impact to Infrastructure",
        "viewType": "multiValue",
        "valueType": "fraction"
      }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'dataBuilderConfig', 'viewJson'],
        [
          'Disaster_Response_Operational_Facilities',
          'disasterAffectedOrganisationOperationalData',
          `{}`,
          `{
        "type": "view",
        "name": "Facilities Operational Status",
        "viewType": "multiSingleValue",
        "valueType": "fraction"
      }`,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),

    db.runSql(`
    UPDATE "dashboardGroup" SET "dashboardReports" = "dashboardReports" || '{"Disaster_Response_Infrastructure_Impact", "Disaster_Response_Operational_Facilities"}' WHERE ("organisationLevel" = 'Province' OR "organisationLevel" = 'Country') AND name = 'Disaster Response';
    `),
  ]).then(() => callback());
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
