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
          'Raw_Data_Core_Surveys',
          'rawDataDownload',
          `{
        "name": "Download Raw Data",
        "type": "view",
        "viewType": "dataDownload",
        "periodGranularity": "month"
      }`,
          `{
        "surveys": [
          { "code": "BCD", "name": "Basic Clinic Data" },
          { "code": "FF", "name": "Facility Fundamentals" },
          { "code": "CD", "name": "Childhood Diarrhoea" },
          { "code": "DP", "name": "Disaster Preparedness & Response" },
          { "code": "SARA", "name": "SARA Survey" }
        ]
      }`,
          true,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'dashboardGroup',
        [
          'code',
          'organisationLevel',
          'userGroup',
          'organisationUnitCode',
          'name',
          'dashboardReports',
        ],
        [
          'Raw_Data_Downloads',
          'Country',
          'Admin',
          'World',
          'Raw Data Downloads',
          '{Raw_Data_Core_Surveys}',
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
