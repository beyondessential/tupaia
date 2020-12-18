import { LATEST_SERVER_SYNC_TIMESTAMP } from '../settings';

/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

const DATABASE_SYNC_MIGRATION_VERSION = 'DATABASE_SYNC_MIGRATION_VERSION';

const migrations = {
  // Re-import Area's and Facilities with organisation unit codes.
  1: async (synchroniser, setProgressMessage) => {
    await resyncRecordTypes(synchroniser, setProgressMessage, ['geographical_area', 'clinic']);
  },
  // Ensure access policy is downloaded for logged in user.
  2: async (synchroniser, setProgressMessage) => {
    setProgressMessage('Updating access policy');
    await synchroniser.api.refreshAccessToken();
  },
  // Resync all permission groups in case they're coming from a version prior to db schema 10
  3: async (synchroniser, setProgressMessage) => {
    await resyncRecordTypes(synchroniser, setProgressMessage, ['permission_group']);
  },
  // Resync all survey screen components so that alternate text labels come through
  4: async (synchroniser, setProgressMessage) => {
    await resyncRecordTypes(synchroniser, setProgressMessage, ['survey_screen_component']);
  },
  // Resync all surveys in case they're coming from a version prior to db schema 10, which stored
  // only the permission group id against the survey, rather than the PermissionGroup db object
  5: async (synchroniser, setProgressMessage) => {
    await resyncRecordTypes(synchroniser, setProgressMessage, ['survey']);
  },
  // Resync all entities, as they didn't exist in prior versions of the app at all
  6: async (synchroniser, setProgressMessage) => {
    await resyncRecordTypes(synchroniser, setProgressMessage, ['entity']);
  },
  // Resync all survey screen components so they will have correct config structure
  7: async (synchroniser, setProgressMessage) => {
    await resyncRecordTypes(synchroniser, setProgressMessage, ['survey_screen_component']);
  },
  // Resync all entities and options so that the new attributes column come through
  8: async (synchroniser, setProgressMessage) => {
    await resyncRecordTypes(synchroniser, setProgressMessage, ['entity', 'option']);
  },
};

export const getSyncMigrations = async database => {
  const currentMigrationVersion = (await database.getSetting(DATABASE_SYNC_MIGRATION_VERSION)) || 0;
  const availableMigrationVersions = Object.keys(migrations)
    .sort()
    .filter(version => version > currentMigrationVersion);
  const hasNeverSynced = await !database.getSetting(LATEST_SERVER_SYNC_TIMESTAMP);
  if (hasNeverSynced) {
    // No need to migrate anything as it will do initial sync, jump the migration version up
    const highestMigrationVersion =
      availableMigrationVersions[availableMigrationVersions.length - 1];
    database.setSetting(DATABASE_SYNC_MIGRATION_VERSION, highestMigrationVersion);
    return [];
  }

  return availableMigrationVersions.map(
    migrationVersion => async (synchroniser, setProgressMessage) => {
      await migrations[migrationVersion](synchroniser, setProgressMessage);
      database.setSetting(DATABASE_SYNC_MIGRATION_VERSION, migrationVersion);
    },
  );
};

const resyncRecordTypes = async (synchroniser, setProgressMessage, recordTypes = []) => {
  const recordTypesFilter = recordTypes.join(',');
  setProgressMessage('Getting migration record count');
  const changeCount = await synchroniser.getIncomingChangeCount(0, {
    recordTypes: recordTypesFilter,
  });

  let changesPulled = 0;
  const pull = async () => {
    setProgressMessage(`Migrating ${changesPulled}/${changeCount} records`);

    const { changes, requestDuration } = await synchroniser.getIncomingChanges(0, changesPulled, {
      recordTypes: recordTypesFilter,
    });

    synchroniser.database.integrateChanges(changes);
    synchroniser.setBatchSize(requestDuration);

    changesPulled += changes.length;

    const isComplete = changesPulled === changeCount;
    if (changes.length === 0 && !isComplete) {
      throw new Error('Migration failed, incorrect record count');
    } else if (!isComplete) {
      await pull();
    }
  };

  await pull();
};
