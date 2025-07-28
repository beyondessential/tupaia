import { constructAccessToken } from '@tupaia/auth';
import { clearTestData, getTestDatabase, getTestModels } from '@tupaia/database';
import { TestableServer } from '@tupaia/server-boilerplate';
import { oneSecondSleep, createBearerHeader } from '@tupaia/utils';
import { SyncableChangeEnqueuer, createPermissionsBasedMeditrakSyncQueue } from '../../../../sync';
import { MeditrakAppServerModelRegistry } from '../../../../types';
import { TestModelRegistry } from '../../../types';
import { grantUserAccess, revokeAccess, setupTestApp, setupTestUser } from '../../../utilities';

import { PERMISSIONS_BASED_SYNC_MIN_APP_VERSION } from '../../../../routes/sync/pullChanges/supportsPermissionsBasedSync';
import { BASIC_ACCESS } from '../../../utilities/grantUserAccess';
import {
  PERM_SYNC_COUNTRY_1,
  PERM_SYNC_COUNTRY_2,
  PERM_SYNC_PG_ADMIN,
  PERM_SYNC_PG_PUBLIC,
  insertPermissionsBasedSyncTestData,
} from './fixtures';

describe('changes/metadata', () => {
  let app: TestableServer;
  let authHeader: string;
  const models = getTestModels() as TestModelRegistry;
  const syncableChangeEnqueuer = new SyncableChangeEnqueuer(
    getTestModels() as unknown as MeditrakAppServerModelRegistry,
  );
  syncableChangeEnqueuer.setDebounceTime(50);

  let testData: {
    countries: any[];
    entities: any[];
    permissionGroups: any[];
    surveys: any[];
  };

  let testStartTime: number;
  let dataImportedTime: number;
  let userId: string;

  beforeAll(async () => {
    testStartTime = Date.now();
    await createPermissionsBasedMeditrakSyncQueue(models.database);
    syncableChangeEnqueuer.listenForChanges();
    app = await setupTestApp();
    app.setDefaultQueryParam('appVersion', PERMISSIONS_BASED_SYNC_MIN_APP_VERSION);

    const user = await setupTestUser();
    userId = user.id;
    authHeader = createBearerHeader(
      constructAccessToken({
        userId: user.id,
        apiClientUserId: undefined,
      }),
    );
    grantUserAccess(userId);

    testData = await insertPermissionsBasedSyncTestData(models);
    await models.database.waitForAllChangeHandlersCompleted();
    dataImportedTime = Date.now();
  });

  afterAll(async () => {
    revokeAccess();
    syncableChangeEnqueuer.stopListeningForChanges();
    await clearTestData(getTestDatabase());
  });

  it('throws an error if no auth header provided', async () => {
    const response = await app.get('changes');
    expect(response.statusCode).toEqual(500);
    expect(response.body.error).toMatch(/.*Authorization header required/);
  });

  it('should throw an error if appVersion lower than permissions based sync version', async () => {
    const olderVersion = '1.10.123';
    const response = await app.get('changes/metadata', {
      headers: {
        Authorization: authHeader,
      },
      query: {
        appVersion: olderVersion,
      },
    });

    expect(response.statusCode).toEqual(500);
    expect(response.body.error).toMatch(
      new RegExp(
        `.*Permissions based sync is not supported for appVersion: ${olderVersion}, must be ${PERMISSIONS_BASED_SYNC_MIN_APP_VERSION} or higher`,
      ),
    );
  });

  it('should return the changeCount, countries, and permissions in the sync', async () => {
    const response = await app.get('changes/metadata', {
      headers: {
        Authorization: authHeader,
      },
    });

    expect(response.statusCode).toEqual(200);
    const { changeCount, countries, permissionGroups } = response.body;
    expect(typeof changeCount).toBe('number');
    expect(countries.sort()).toEqual(Object.keys(BASIC_ACCESS));
    expect(permissionGroups.sort()).toEqual(Object.values(BASIC_ACCESS).flat());
  });

  describe('permissions based syncing', () => {
    describe('initial sync', () => {
      it('should return the number of changes for a user with limited access', async () => {
        revokeAccess();
        grantUserAccess(userId, { [PERM_SYNC_COUNTRY_1.code]: [PERM_SYNC_PG_PUBLIC.name] });
        const response = await app.get('changes/metadata', {
          headers: {
            Authorization: authHeader,
          },
          query: {
            since: testStartTime,
          },
        });

        const { changeCount, countries, permissionGroups } = response.body;
        expect(changeCount).toEqual(20);
        expect(countries.sort()).toEqual([PERM_SYNC_COUNTRY_1.code]);
        expect(permissionGroups.sort()).toEqual([PERM_SYNC_PG_PUBLIC.name]);
      });

      it('should return the number of changes for a user with full access', async () => {
        revokeAccess();
        grantUserAccess(userId, {
          [PERM_SYNC_COUNTRY_1.code]: [PERM_SYNC_PG_PUBLIC.name, PERM_SYNC_PG_ADMIN.name],
          [PERM_SYNC_COUNTRY_2.code]: [PERM_SYNC_PG_PUBLIC.name, PERM_SYNC_PG_ADMIN.name],
        });
        const response = await app.get('changes/metadata', {
          headers: {
            Authorization: authHeader,
          },
          query: {
            since: testStartTime,
          },
        });

        const { changeCount, countries, permissionGroups } = response.body;
        expect(changeCount).toEqual(28);
        expect(countries.sort()).toEqual([PERM_SYNC_COUNTRY_1.code, PERM_SYNC_COUNTRY_2.code]);
        expect(permissionGroups.sort()).toEqual([
          PERM_SYNC_PG_ADMIN.name,
          PERM_SYNC_PG_PUBLIC.name,
        ]);
      });
    });

    describe('subsequent syncs', () => {
      it('should sync previously unsynced data when given access to a new country', async () => {
        revokeAccess();
        grantUserAccess(userId, {
          [PERM_SYNC_COUNTRY_1.code]: [PERM_SYNC_PG_PUBLIC.name],
          [PERM_SYNC_COUNTRY_2.code]: [PERM_SYNC_PG_PUBLIC.name], // Grant access to a previously unsynced country
        });
        const response = await app.get('changes/metadata', {
          headers: {
            Authorization: authHeader,
          },
          query: {
            since: dataImportedTime,
            countriesSynced: [PERM_SYNC_COUNTRY_1.code],
            permissionGroupsSynced: [PERM_SYNC_PG_PUBLIC.name],
          },
        });

        const { changeCount, countries } = response.body;
        expect(changeCount).toEqual(10);
        expect(countries.sort()).toEqual([PERM_SYNC_COUNTRY_1.code, PERM_SYNC_COUNTRY_2.code]);
      });

      it('should sync previously unsynced data when given access to a new permission group', async () => {
        revokeAccess();
        grantUserAccess(userId, {
          // Grant access to a previously unsynced permission group
          [PERM_SYNC_COUNTRY_1.code]: [PERM_SYNC_PG_PUBLIC.name, PERM_SYNC_PG_ADMIN.name],
        });
        const response = await app.get('changes/metadata', {
          headers: {
            Authorization: authHeader,
          },
          query: {
            since: dataImportedTime,
            countriesSynced: [PERM_SYNC_COUNTRY_1.code],
            permissionGroupsSynced: [PERM_SYNC_PG_PUBLIC.name],
          },
        });

        const { changeCount, permissionGroups } = response.body;
        expect(changeCount).toEqual(5);
        expect(permissionGroups.sort()).toEqual([
          PERM_SYNC_PG_ADMIN.name,
          PERM_SYNC_PG_PUBLIC.name,
        ]);
      });

      it("should sync previously unsynced data when a survey's permission group changes", async () => {
        const startOfThisTest = Date.now();

        // Make survey4 have 'public' permissions
        const survey4 = testData.surveys.find(
          ({ survey }) => survey.code === 'PERM_SYNC_SURVEY_4',
        ).survey;
        const publicPermissionGroupId = testData.permissionGroups.find(
          pg => pg.name === PERM_SYNC_PG_PUBLIC.name,
        ).id;
        survey4.permission_group_id = publicPermissionGroupId;
        await survey4.save();

        await oneSecondSleep();
        await models.database.waitForAllChangeHandlersCompleted();

        revokeAccess();
        grantUserAccess(userId, {
          [PERM_SYNC_COUNTRY_1.code]: [PERM_SYNC_PG_PUBLIC.name],
        });

        const response = await app.get('changes/metadata', {
          headers: {
            Authorization: authHeader,
          },
          query: {
            since: startOfThisTest,
            countriesSynced: [PERM_SYNC_COUNTRY_1.code],
            permissionGroupsSynced: [PERM_SYNC_PG_PUBLIC.name],
          },
        });

        const { changeCount } = response.body;
        expect(changeCount).toEqual(4);
      });

      it("should sync previously unsynced data when a survey's countries changes", async () => {
        const startOfThisTest = Date.now();

        // Make survey4 have 'public' permissions
        const survey3 = testData.surveys.find(
          ({ survey }) => survey.code === 'PERM_SYNC_SURVEY_3',
        ).survey;
        const country1Id = testData.countries.find(c => c.code === PERM_SYNC_COUNTRY_1.code).id;
        survey3.country_ids = [...survey3.country_ids, country1Id];
        await survey3.save();

        await oneSecondSleep();
        await models.database.waitForAllChangeHandlersCompleted();

        revokeAccess();
        grantUserAccess(userId, {
          [PERM_SYNC_COUNTRY_1.code]: [PERM_SYNC_PG_ADMIN.name],
        });

        const response = await app.get('changes/metadata', {
          headers: {
            Authorization: authHeader,
          },
          query: {
            since: startOfThisTest,
            countriesSynced: [PERM_SYNC_COUNTRY_1.code],
            permissionGroupsSynced: [PERM_SYNC_PG_ADMIN.name],
          },
        });

        const { changeCount } = response.body;
        expect(changeCount).toEqual(4);
      });
    });
  });
});
