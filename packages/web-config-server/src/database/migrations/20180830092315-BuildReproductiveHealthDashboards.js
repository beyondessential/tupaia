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
          'TO_RH_D07.1',
          'sumPerDataElementGroupPerMonth',
          `{
        "type": "chart",
        "name": "Reproductive Health Visits by Type per Month",
        "xName": "Month",
        "yName": "Number of Visits",
        "chartType": "bar",
        "presentationOptions": {
          "DE_GROUP-Monthly_Home_Visit_Counts": {
            "color": "#279A63", "label": "Home Visits"
          },
          "DE_GROUP-Monthly_Clinic_Visit_Counts": {
            "color": "#EE9A30", "label": "Clinic Visits"
          }
        }
      }`,
          `{
      "dataElementGroups": [ "DE_GROUP-Monthly_Home_Visit_Counts", "DE_GROUP-Monthly_Clinic_Visit_Counts" ]
      }`,
          false,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `INSERT INTO "dashboardGroup" ("code", "organisationLevel", "userGroup", "organisationUnitCode", "name", "dashboardReports") VALUES ('Tonga_Reproductive_Health_Facility', 'Facility','Tonga Reproductive Health', 'World', 'Reproductive Health', '{"TO_RH_D07.1"}')`,
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
