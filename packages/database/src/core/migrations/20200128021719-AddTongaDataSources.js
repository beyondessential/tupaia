'use strict';

import { generateId } from '../utilities/generateId';

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

const dataSourceCodes = require('./migrationData/20200128021719-AddTongaDataSources/AllTongaDataSources.json');
const specialConfigs = require('./migrationData/20200128021719-AddTongaDataSources/TongaDataSourcesWithCategoryCombos.json');

exports.up = function (db) {
  const dataSourceValues = dataSourceCodes.map(code => {
    const specialConfig = specialConfigs[code] || {};
    const config = { ...specialConfig, isDataRegional: false };
    return `('${generateId()}', '${code}', 'dataElement', 'dhis', '${JSON.stringify(config)}')`;
  });
  return db.runSql(`
    INSERT INTO data_source (id, code, type, service_type, config) VALUES
    ${dataSourceValues.join(',\n')};
  `);
};

exports.down = function (db) {
  return db.runSql('TRUNCATE TABLE data_source');
};

exports._meta = {
  version: 1,
};
