'use strict';

import { arrayToDbString } from '../utilities';

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

const elementList = [
  'FF20',
  'FF21',
  'FF22',
  'FF23',
  'FF24',
  'FF25',
  'FF26',
  'FF27',
  'FF28',
  'FF29',
  'FF30',
  'FF31',
  'FF32',
  'FF33',
];
const changeServiceType = async (db, serviceType) => {
  await db.runSql(`
    UPDATE data_source 
    SET service_type = '${serviceType}'
    WHERE code in (${arrayToDbString(elementList)})
  `);
};
exports.up = async function (db) {
  await changeServiceType(db, 'tupaia');
};

exports.down = async function (db) {
  await changeServiceType(db, 'dhis');
};

exports._meta = {
  version: 1,
};
