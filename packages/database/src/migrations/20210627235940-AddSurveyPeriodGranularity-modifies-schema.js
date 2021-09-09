'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  await db.runSql(
    `CREATE TYPE period_granularity AS ENUM('yearly', 'quarterly', 'monthly', 'weekly', 'daily')`,
  );
  await db.addColumn('survey', 'period_granularity', {
    type: 'period_granularity',
  });
  await db.addColumn('survey_response', 'outdated', {
    type: 'boolean',
    defaultValue: 'false',
  });
};

exports.down = async function (db) {
  await db.removeColumn('survey', 'period_granularity');
  await db.removeColumn('survey_response', 'outdated');
  await db.runSql('DROP TYPE period_granularity');
};

exports._meta = {
  version: 1,
};
