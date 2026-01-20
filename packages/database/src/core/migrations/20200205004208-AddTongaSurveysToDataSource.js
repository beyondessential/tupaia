'use strict';

import { generateId } from '../utilities/generateId';;

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
  const tongaSurveys = (
    await db.runSql(`
    SELECT code FROM survey WHERE integration_metadata::text LIKE '%isDataRegional": false%';
  `)
  ).rows;
  const dataSourceValues = tongaSurveys.map(({ code }) => {
    const config = { isDataRegional: false };
    return `('${generateId()}', '${code}', 'dataGroup', 'dhis', '${JSON.stringify(config)}')`;
  });
  return db.runSql(`
    INSERT INTO data_source (id, code, type, service_type, config) VALUES
    ${dataSourceValues.join(',\n')};
  `);
};

exports.down = function (db) {
  return db.runSql(`
    DELETE FROM data_source WHERE type = 'dataGroup';
  `);
};

exports._meta = {
  version: 1,
};
