'use strict';
import { models } from '../migrate';
import { SyncQueue as GenericSyncQueue } from '../../database';
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

exports.up = async function(db) {
  return new Promise(async (resolve, reject) => {
    try {
      const { database } = models;
      const { addChangeHandlerForCollection } = database;
      const options = {
        columns: ['id', 'code', 'parent_id', 'name', 'type', 'point', 'image_url', 'country_code'],
      };
      // will need to create the synch queue so that it is listening
      new GenericSyncQueue(models, models.meditrakSyncQueue, ['entity']);

      const entities = await database.find(models.entity.databaseType);
      let changeCounter = entities.length;
      addChangeHandlerForCollection('entity', () => {
        changeCounter--;
        if (!changeCounter) resolve();
      });
      if (!entities.length) resolve();
      return Promise.all(
        entities.map(async entity => {
          const { id } = entity;
          return database.markAsChanged(models.entity.databaseType, { id }, options);
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
