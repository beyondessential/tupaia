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

const convertToNewConfig = config => {
  const { fetch, transform, ...restOfConfig } = config;
  if (!fetch) {
    return config;
  }
  const fetchDataTransform = { transform: 'fetchData', parameters: fetch };
  const newTransform = [fetchDataTransform, ...transform];
  return { transform: newTransform, ...restOfConfig };
};

const convertToOldConfig = config => {
  const { transform, ...restOfConfig } = config;
  if (!transform) {
    return config;
  }
  const fetchDataTransform = transform.shift();
  return { fetch: fetchDataTransform.parameters, transform, ...restOfConfig };
};

const getReports = async db => (await db.runSql('SELECT * from report')).rows;

exports.up = async function (db) {
  const reports = await getReports(db);

  for (let i = 0; i < reports.length; i++) {
    const { code, config } = reports[i];
    const newConfig = convertToNewConfig(config);
    const newConfigString = JSON.stringify(newConfig).replace(/'/g, "''");

    await db.runSql(`
        UPDATE report
        SET config = '${newConfigString}'::jsonb
        WHERE code = '${code}';
      `);
  }

  return null;
};

exports.down = async function (db) {
  const reports = await getReports(db);

  for (let i = 0; i < reports.length; i++) {
    const { code, config } = reports[i];
    const oldConfig = convertToOldConfig(config);
    const oldConfigString = JSON.stringify(oldConfig).replace(/'/g, "''");

    await db.runSql(`
      UPDATE report
      SET config = '${oldConfigString}'::jsonb
      WHERE code = '${code}';
    `);
  }

  return null;
};

exports._meta = {
  version: 1,
};
