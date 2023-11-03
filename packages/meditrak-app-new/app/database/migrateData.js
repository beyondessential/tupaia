/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import compareVersions from 'semver-compare';

import { getAppVersions, saveAppVersion } from '../version';

export async function migrateDataToAppVersion(database) {
  const { current: currentAppVersion, new: newAppVersion } = await getAppVersions();
  const didUpdateVersion = currentAppVersion !== newAppVersion;
  if (didUpdateVersion) {
    migrateData(database, currentAppVersion, newAppVersion);
    saveAppVersion(newAppVersion);
  }
}

async function migrateData(database, fromVersion, toVersion) {
  // Do any required version update data migrations
  dataMigrations.forEach(migration => {
    if (
      compareVersions(fromVersion, migration.version) < 0 &&
      compareVersions(toVersion, migration.version) >= 0
    ) {
      migration.migrate(database);
    }
  });
}

// All data migration functions should be kept in this array, in sequential order. Each migration
// needs a 'version' key, denoting the version that migration will migrate to, and a 'migrate' key,
// which is a function taking the database and performs the migration
const dataMigrations = [
  {
    // Delete logged in country variable which stored the current users selected
    // country in previous versions.
    version: '1.6.79',
    migrate: database => database.deleteSetting('LOGGED_IN_COUNTRY_ID'),
  },
];
