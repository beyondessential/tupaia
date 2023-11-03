/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { Database as RNDB, Settings } from 'react-native-database';
import generateUUID from 'bson-objectid';

import { migrateDataToAppVersion } from './migrateData';
import { schema } from './schema';

export class Database extends RNDB {
  /**
   * Creates a database based on react-native-database's realm db, but with automatic ids as well as
   * additional functionality making it easier to deal with settings and other objects
   */
  constructor() {
    super(schema);
    this.settings = new Settings(this);
    migrateDataToAppVersion(this);
  }

  create(type, object, ...args) {
    const objectWithId = {
      id: generateUUID().toString(),
      ...object,
    };
    return super.create(type, objectWithId, ...args);
  }

  update(type, object, ...args) {
    const objectWithId = {
      id: generateUUID().toString(),
      ...object, // If object already has id, it will be used rather than the one generated above
    };
    return super.update(type, objectWithId, ...args);
  }

  delete(type, ...args) {
    return super.delete(type, ...args);
  }

  /**
   * Returns the database object with the given id, if it exists, or creates a
   * placeholder with that id if it doesn't.
   * @param  {string} type             The type of database object
   * @param  {string} primaryKey       The primary key of the database object, usually its id
   * @param  {string} primaryKeyField  The field used as the primary key, defaults to 'id'
   * @return {Realm.object}            Either the existing database object with the given
   *                                   primary key, or a placeholder if none
   */
  getOrCreate(type, primaryKey, primaryKeyField = 'id') {
    const object = { [primaryKeyField]: primaryKey };
    return this.update(type, object);
  }

  deleteByPrimaryKey(type, primaryKey, primaryKeyField = 'id') {
    const deleteResults = this.objects(type).filtered(`${primaryKeyField} == $0`, primaryKey);
    if (deleteResults && deleteResults.length > 0) this.delete(type, deleteResults[0]);
  }

  findOne(type, searchKey, searchKeyField = 'id') {
    if (!searchKey || searchKey.length < 1) throw new Error('Cannot find without a search key');
    const results = super.objects(type).filtered(`${searchKeyField} == $0`, searchKey);
    if (results.length > 0) return results[0];
    return null;
  }

  find(type, conditions = {}) {
    const filterStrings = Object.keys(conditions).map(conditionKey => {
      let conditionValue = conditions[conditionKey];
      if (typeof conditionValue === 'string') {
        conditionValue = `"${conditionValue}"`;
      }

      return `${conditionKey} == ${conditionValue}`;
    });

    return this.objects(type).filtered(filterStrings.join(' AND '));
  }

  setSettings(settings) {
    Object.entries(settings).forEach(([key, value]) => this.setSetting(key, value));
  }

  setSetting(key, value = '') {
    return this.settings.set(key, value);
  }

  getSettings(settingsKeys) {
    const settings = {};
    settingsKeys.forEach(settingKey => {
      settings[settingKey] = this.getSetting(settingKey);
    });
    return settings;
  }

  getSetting(key) {
    return this.settings.get(key);
  }

  deleteSettings(keys) {
    keys.forEach(key => this.deleteSetting(key));
  }

  deleteSetting(key) {
    return this.settings.delete(key);
  }
}
