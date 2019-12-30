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

const OLD_TO_NEW_NAME = {
  sumLatestData: 'sumLatestPerMetric',
  sumLatestSeriesData: 'sumLatestPerSeries',
  sumAllData: 'sumAllPerMetric',
};

const renameBuilder = async (db, oldName, newName) =>
  db.runSql(
    `UPDATE "dashboardReport" SET "dataBuilder" = '${newName}' WHERE "dataBuilder" = '${oldName}';`,
  );

exports.up = function(db) {
  return Promise.all(
    Object.entries(OLD_TO_NEW_NAME).map(([oldName, newName]) =>
      renameBuilder(db, oldName, newName),
    ),
  );
};

exports.down = function(db) {
  return Promise.all(
    Object.entries(OLD_TO_NEW_NAME).map(([oldName, newName]) =>
      renameBuilder(db, newName, oldName),
    ),
  );
};

exports._meta = {
  version: 1,
};
