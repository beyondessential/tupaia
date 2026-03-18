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

const convertFetchDataTransformToUseDataTables = transform => {
  const { parameters } = transform;
  // If passing both data group as param, then fetching events
  if (parameters.dataGroupCode) {
    return { ...transform, dataTableCode: 'events' };
  }

  return { ...transform, dataTableCode: 'analytics' };
};

const revertFetchDataTransformFromUsingDataTables = transform => {
  const { dataTableCode, ...restOfTransform } = transform;
  return { ...restOfTransform };
};

const convertToNewConfig = config => {
  const { transform, ...restOfConfig } = config;

  if (!transform) {
    return config;
  }

  const newTransform = transform.map(tform => {
    if (tform.transform === 'fetchData') {
      return convertFetchDataTransformToUseDataTables(tform);
    }
    return tform;
  });
  return { transform: newTransform, ...restOfConfig };
};

const convertToOldConfig = config => {
  const { transform, ...restOfConfig } = config;
  if (!transform) {
    return config;
  }

  const newTransform = transform.map(tform => {
    if (tform.transform === 'fetchData') {
      return revertFetchDataTransformFromUsingDataTables(tform);
    }
    return tform;
  });
  return { transform: newTransform, ...restOfConfig };
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
