'use strict';

import { models } from '../migrate';
import { SyncQueue as GenericSyncQueue } from '..';

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

exports.up = function(db) {
  return new Promise(async (resolve, reject) => {
    try {
      const { database } = models;
      const { addChangeHandlerForCollection } = database;

      const answers = await database.find(models.answer.databaseType, { type: 'Date' });
      let changeCounter = answers.length;
      addChangeHandlerForCollection('answer', () => {
        changeCounter--;
        if (!changeCounter) resolve();
      });
      if (!answers.length) resolve();
      return Promise.all(
        answers.map(async answer => {
          const { id } = answer;
          return database.markAsChanged(models.answer.databaseType, { id });
        }),
      );
    } catch (error) {
      reject(error);
    }
  });
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
