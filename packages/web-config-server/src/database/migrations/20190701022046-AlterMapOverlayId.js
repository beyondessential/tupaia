'use strict';

import { insertObject } from '../migrationUtilities';

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

const releaseCachedQueryPlans = async db => db.runSql('DISCARD PLANS');

exports.up = async function(db) {
  await db.changeColumn('mapOverlay', 'id', {
    type: 'text',
    notNull: true,
    unique: true,
  });
  await db.changeColumn('mapOverlay', 'linkedMeasures', {
    type: 'text[]',
  });

  return releaseCachedQueryPlans(db);
};

exports.down = async function(db) {
  await db.changeColumn('mapOverlay', 'id', {
    type: 'integer',
    notNull: true,
    unique: false,
    default: `nextval('"mapOverlay_id_seq"'::regclass)`,
  });

  await db.changeColumn('mapOverlay', 'linkedMeasures', {
    type: 'integer[]',
  });

  return releaseCachedQueryPlans(db);
};

exports._meta = {
  version: 1,
};
