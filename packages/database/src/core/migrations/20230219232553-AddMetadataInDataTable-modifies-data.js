'use strict';

const { generateId, arrayToDbString } = require('../utilities');

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

const newTypes = ['data_group_metadata', 'data_element_metadata'];

exports.up = async function (db) {
  const query = newTypes
    .map(t => {
      const metadataDescription = `Fetches metadata for ${t.split('_').slice(0, 2).join(' ')}`;
      return `
      INSERT INTO data_table VALUES ('${generateId()}','${t}', '${metadataDescription}', '{}', '{"*"}', '${t}');
      `;
    })
    .join(';');

  return db.runSql(query);
};

exports.down = async function (db) {
  return db.runSql(`DELETE FROM data_table WHERE type IN (${arrayToDbString(newTypes)});`);
};

exports._meta = {
  version: 1,
};
