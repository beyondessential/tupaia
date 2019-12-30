'use strict';
import { generateId } from '../generateId';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async db => {
  const results = await db.all(`
    SELECT * from feed_item
    WHERE type = 'markdown'
  `);
  await results.map(async result => {
    if (typeof result.id.length !== 24) {
      return db.runSql(
        `
        UPDATE feed_item
        SET id=?
        WHERE id='${result.id}'
      `,
        [generateId()],
      );
    }
  });
  return null;
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
