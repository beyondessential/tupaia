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
        ['id', 'dataBuilder', 'viewJson', 'dataBuilderConfig'],
        [
          'Raw_Data_Venezuela_Surveys',
          'rawDataDownload',
          `{
        "name": "Download Raw Data",
        "type": "view",
        "viewType": "dataDownload",
        "periodGranularity": "month"
      }`,
          `{
        "surveys": [
          { "code": "VEN_SEP", "name": "Sondeo de las Experiencias de los Pacientes" },
          { "code": "VEN_ESH", "name": "Encuesta Semanal de Hospitales en Venezuela" },
          { "code": "VEN_EAE", "name": "Encuesta de Agua y Electricidad" }
        ]
      }`,
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
          'VEN_Raw_Data_Downloads',
          'Country',
          'Admin',
          'VE',
          'Venezuela Custom Downloads',
          '{Raw_Data_Venezuela_Surveys}',
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
