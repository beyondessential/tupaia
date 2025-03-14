'use strict';

import { generateId } from '../utilities';

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
  await db.runSql(`
    INSERT INTO data_source (id, code, type, service_type, config)
      VALUES ('${generateId()}', 'WTHR_RH', 'dataElement', 'weather', '{}');
    INSERT INTO data_source (id, code, type, service_type, config)
      VALUES ('${generateId()}', 'WTHR_FORECAST_RH', 'dataElement', 'weather', '{"weatherForecastData": true}');
	`);

  return null;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
