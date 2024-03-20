'use strict';

import { TupaiaDatabase } from '../TupaiaDatabase';
import { replaceEnum } from '../utilities/migration';

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

const getExistingEnumOptions = async db => {
  const rows = await db.executeSql(`
    SELECT UNNEST(enum_range(null::entity_type)) as type;
  `);
  return rows.map(row => row.type);
};

exports.up = async function () {
  const db = new TupaiaDatabase();

  const existingEnumOptions = await getExistingEnumOptions(db);
  if (!existingEnumOptions.includes('disaster')) {
    return;
  }
  const newEnumOptions = existingEnumOptions.filter(option => option !== 'disaster');
  await replaceEnum(db, 'entity_type', newEnumOptions);

  db.closeConnections();
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
