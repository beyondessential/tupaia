'use strict';

import { insertObject, generateId } from '../utilities';

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

/**
 * @param {string|null} configInput
 */
const createDataGroupConfig = configInput => {
  // `eventOrgUnit` is not relevant to `dataGroup` records
  const { eventOrgUnit, ...config } = JSON.parse(configInput) || {};
  return config;
};

const createDataGroupsToInsert = async db => {
  const { rows: dataGroups } = await db.runSql(`
    SELECT code, 'dataGroup' as type, 'dhis' as service_type, integration_metadata->>'dhis2' as config
    FROM survey WHERE code NOT IN (
      SELECT code FROM data_source WHERE type = 'dataGroup'
    )
  `);

  return dataGroups.map(dataGroup => ({
    ...dataGroup,
    id: generateId(),
    config: createDataGroupConfig(dataGroup.config),
  }));
};

exports.up = async function (db) {
  const dataGroups = await createDataGroupsToInsert(db);

  for (let i = 0; i < dataGroups.length; i++) {
    const dataGroup = dataGroups[i];
    await insertObject(db, 'data_source', dataGroup);
  }
};

exports.down = async function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
