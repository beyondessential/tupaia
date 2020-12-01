'use strict';

import { arrayToDbString, generateId, insertObject, updateValues } from '../utilities';

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

const surveyCodes = ['RHC', 'RHFSC', 'RHFSCTS'];

const switchServiceType = async (db, code, serviceType) => {
  await updateValues(db, 'data_source', { service_type: serviceType }, { code });
};

const getDataSources = async (db, codes) => {
  const surveyCodeQuery = codes.map(e => `'${e}'`).join(',');
  return db.runSql(`
  select ds.id, ds.code from data_source ds 
    join data_element_data_group dedg on ds.id = dedg.data_element_id 
    join data_source ds2 on ds2.id = dedg.data_group_id 
  where ds2.code in (${surveyCodeQuery}) 
  group by (ds.id, ds.code)
  `);
};

exports.up = async function (db) {
  const { rows: dataSources } = await getDataSources(db, surveyCodes);
  const serviceType = 'tupaia';

  for (const dataSource of dataSources) {
    await switchServiceType(db, dataSource.code, serviceType);
  }

  for (const code of surveyCodes) {
    await switchServiceType(db, code, serviceType);
  }
};

exports.down = async function (db) {
  const { rows: dataSources } = await getDataSources(db, surveyCodes);
  const serviceType = 'dhis';

  for (const dataSource of dataSources) {
    await switchServiceType(db, dataSource.code, serviceType);
  }

  for (const code of surveyCodes) {
    await switchServiceType(db, code, serviceType);
  }
};

exports._meta = {
  version: 1,
};
