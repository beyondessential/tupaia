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

exports.up = async function(db, callback) {
  const rejectOnError = (resolve, reject, error) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  };

  await db.runSql(`
      ALTER TABLE "dashboardReport" ALTER COLUMN "dataBuilder" DROP NOT NULL;
  `);

  return Promise.all([
    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'viewJson', 'isDataRegional'],
        [
          'active_disasters',
          `{
      "type": "component",
      "componentName": "ActiveDisasters",
      "name": "Basic Disaster Information"
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
          'organisationLevel',
          'userGroup',
          'organisationUnitCode',
          'name',
          'dashboardReports',
          'viewMode',
        ],
        ['World', 'Public', 'World', 'Disaster Response', '{active_disasters}', 'disaster'],
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
