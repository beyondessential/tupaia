'use strict';

import { generateId, insertObject, deleteObject } from '../utilities';

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

exports.up = function (db) {
  return insertObject(db, 'sync_cursor', {
    id: generateId(),
    service_name: 'KoBo',
    sync_time: new Date(0),
    config: { koboSurveys: ['FQS1', 'FQS2'] },
  });
};

exports.down = function (db) {
  return deleteObject(db, 'sync_cursor', { service_name: 'KoBo' });
};

exports._meta = {
  version: 1,
};
