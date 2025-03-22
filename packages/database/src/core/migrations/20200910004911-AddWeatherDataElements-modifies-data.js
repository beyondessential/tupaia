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
  for (const code of ['WTHR_PRECIP', 'WTHR_MAX_TEMP', 'WTHR_MIN_TEMP']) {
    await db.runSql(
      `INSERT INTO data_source (id, code, type, service_type, config) VALUES ('${generateId()}', '${code}', 'dataElement', 'weather', '{}');`,
    );
  }

  for (const code of ['WTHR_FORECAST_PRECIP', 'WTHR_FORECAST_MAX_TEMP', 'WTHR_FORECAST_MIN_TEMP']) {
    await db.runSql(
      `INSERT INTO data_source (id, code, type, service_type, config) VALUES ('${generateId()}', '${code}', 'dataElement', 'weather', '{"weatherForecastData": true}');`,
    );
  }

  return null;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
