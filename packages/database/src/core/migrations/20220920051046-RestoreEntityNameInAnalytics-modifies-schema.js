'use strict';

import { createBuildAnalyticsTableFunction } from './migrationData/buildAnalyticsTableFunction/createBuildAnalyticsTableFunction.v1';

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
  await db.runSql(createBuildAnalyticsTableFunction);

  // Force rebuild is required to integrate this change with the analytics table
  await db.runSql('SELECT build_analytics_table(true);');
  await db.runSql('SELECT create_analytics_table_indexes();');
  return null;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
