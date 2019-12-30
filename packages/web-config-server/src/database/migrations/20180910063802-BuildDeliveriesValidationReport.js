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
        ['id', 'dataBuilder', 'viewJson', 'queryJson', 'isDataRegional'],
        [
          'TO_RH_Validation_MCH06',
          'tableOfEvents',
          `{
        "type": "chart",
        "name": "Monthly Deliveries",
        "chartType": "matrix",
        "placeholder": "/static/media/PEHSMatrixPlaceholder.png"
      }`,
          `{
        "programCode": "MCH06",
        "columns": {
          "MCH75": {},
          "MCH76": { "additionalData": ["MCH77"] },
          "MCH78": { "additionalData": ["MCH79"] },
          "MCH80": { "shouldShowTotal": true },
          "MCH81": { "additionalData": ["MCH87", "MCH93", "MCH99"], "shouldNumberLines": true },
          "MCH83": { "additionalData": ["MCH89", "MCH95", "MCH101"], "shouldNumberLines": true },
          "MCH84": { "additionalData": ["MCH90", "MCH96", "MCH102"], "shouldNumberLines": true },
          "MCH85": { "additionalData": ["MCH91", "MCH97", "MCH103"], "shouldNumberLines": true },
          "MCH104": {},
          "MCH105": {},
          "MCH106": {},
          "MCH107": {},
          "MCH108": {}
        }
      }`,
          false,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `UPDATE "dashboardGroup" SET "dashboardReports" = "dashboardReports" || '{"TO_RH_Validation_MCH06"}' WHERE code = 'Tonga_Reproductive_Health_Facility'`,
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
