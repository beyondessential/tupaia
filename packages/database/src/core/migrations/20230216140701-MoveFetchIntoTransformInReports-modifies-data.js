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

const convertToNewKeys = (fetchConfig, dataGroupCode) => {
  const convertedConfig = {};
  const { dataElements, dataGroups, aggregations, ...restOfFetchConfig } = fetchConfig;
  if (dataElements) convertedConfig.dataElementCodes = dataElements;
  if (dataGroupCode) {
    convertedConfig.dataGroupCode = dataGroupCode;
  }
  if (aggregations) {
    convertedConfig.aggregations = aggregations.map(aggregation => {
      if (typeof aggregation === 'string') {
        return {
          type: aggregation,
        };
      }
      return aggregation;
    });
  }

  return {
    ...convertedConfig,
    ...restOfFetchConfig,
  };
};

const convertToOldKeys = fetchConfig => {
  const convertedConfig = {};
  const { dataElementCodes, dataGroupCode, ...restOfFetchConfig } = fetchConfig;
  if (dataElementCodes) convertedConfig.dataElements = dataElementCodes;
  if (dataGroupCode) convertedConfig.dataGroups = [dataGroupCode];
  return {
    ...convertedConfig,
    ...restOfFetchConfig,
  };
};

const convertToNewConfig = config => {
  const { fetch, transform, ...restOfConfig } = config;
  if (!fetch) {
    return config;
  }
  const { dataGroups } = fetch;
  if (!dataGroups) {
    const fetchConfigWithNewKeys = convertToNewKeys(fetch);
    const fetchDataTransform = { transform: 'fetchData', parameters: fetchConfigWithNewKeys };
    const newTransformSet = [fetchDataTransform, ...transform];
    return { transform: newTransformSet, ...restOfConfig };
  }
  const fetchTransforms = dataGroups.map((dataGroupCode, index) => {
    const fetchConfigWithNewKeys = convertToNewKeys(fetch, dataGroupCode);
    const fetchTransform = {
      transform: 'fetchData',
      parameters: fetchConfigWithNewKeys,
    };
    // not the last one
    if (index !== dataGroups.length - 1) {
      fetchTransform.exitOnNoData = false;
    }
    return fetchTransform;
  });
  const newTransformSet = [...fetchTransforms, ...transform];
  return { transform: newTransformSet, ...restOfConfig };
};

const convertToOldConfig = config => {
  const { transform, ...restOfConfig } = config;
  if (!transform) {
    return config;
  }
  const fetchTransforms = transform.filter(tr => tr.transform === 'fetchData');
  if (fetchTransforms.length > 1) {
    const dataGroups = fetchTransforms.map(fetch => fetch.dataGroupCode);
    const fetchDataTransform = transform.shift();
    const parametersWithOldKeys = convertToOldKeys(fetchDataTransform.parameters);
    parametersWithOldKeys.dataGroups = dataGroups;
    transform.shift();
    return { fetch: parametersWithOldKeys, transform, ...restOfConfig };
  }
  const fetchDataTransform = transform.shift();
  const parametersWithOldKeys = convertToOldKeys(fetchDataTransform.parameters);
  return { fetch: parametersWithOldKeys, transform, ...restOfConfig };
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
