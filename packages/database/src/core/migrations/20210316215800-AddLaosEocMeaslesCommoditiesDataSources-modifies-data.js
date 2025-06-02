'use strict';

import { arrayToDbString, insertObject, generateId } from '../utilities';

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

// Data elements
const dataSources = [
  // Fdb2TF3E52I 	Ferrous sulfate 60mg + folic acid 0.4mg
  {
    id: generateId(),
    code: 'LA_SOH_41e9d4bf',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'Fdb2TF3E52I', isDataRegional: false },
  },
  // Mkqu5ZVE3C1 	Retinol 100,000 IU soft get cap
  {
    id: generateId(),
    code: 'LA_SOH_61d3f4bf',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'Mkqu5ZVE3C1', isDataRegional: false },
  },
  // QaC3fjHFJvN Retinol 200,000 IU soft get cap
  {
    id: generateId(),
    code: 'LA_SOH_61fe94bf',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'QaC3fjHFJvN', isDataRegional: false },
  },
];

exports.up = async function (db) {
  await Promise.all(dataSources.map(dataSource => insertObject(db, 'data_source', dataSource)));
};

exports.down = function (db) {
  return db.runSql(`
    delete from "data_source" where code in (${arrayToDbString(dataSources.map(ds => ds.code))});
  `);
};

exports._meta = {
  version: 1,
};
