import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;

import { oneSecondSleep } from '@tupaia/utils';
import { MeditrakSyncQueue, createPermissionsBasedMeditrakSyncQueue } from '../../../database';
import { TestableApp } from '../../testUtilities';
import { PERMISSIONS_BASED_SYNC_MIN_APP_VERSION } from '../../../apiV2/meditrakApp/meditrakSync';
import {
  insertPermissionsBasedSyncTestData,
  PERM_SYNC_COUNTRY_1,
  PERM_SYNC_COUNTRY_2,
  PERM_SYNC_PG_ADMIN,
  PERM_SYNC_PG_PUBLIC,
} from './permissionsBasedSync.fixtures';

describe('GET /changes/metadata', async () => {
  const app = new TestableApp();
  const { models } = app;
  const meditrakSyncQueue = new MeditrakSyncQueue(models);

  const basicAccess = {
    DL: ['Public'],
  };

  let testData;
  let testStartTime;
  let dataImportedTime;

  before(async () => {
    await app.grantAccess(basicAccess);

    // Set up real sync queue for testing the /changes endpoint
    testStartTime = Date.now();
    await createPermissionsBasedMeditrakSyncQueue(models.database);
    meditrakSyncQueue.setDebounceTime(100); // Faster debounce time for tests
    meditrakSyncQueue.listenForChanges();

    testData = await insertPermissionsBasedSyncTestData();
    await models.database.waitForAllChangeHandlers();
    dataImportedTime = Date.now();
  });

  after(() => {
    meditrakSyncQueue.stopListeningForChanges();
    app.revokeAccess();
  });

  it('should throw an error if no appVersion provided', async function () {
    const response = await app.get('changes/metadata');

    expect(response.statusCode).to.equal(500);
    expect(response.body.error).to.match(/.*Must provide 'appVersion' url parameter/);
  });

  it('should throw an error if appVersion lower than permissions based sync version', async function () {
    const olderVersion = '1.10.123';
    const response = await app.get('changes/metadata', {
      query: {
        appVersion: olderVersion,
      },
    });

    expect(response.statusCode).to.equal(500);
    expect(response.body.error).to.match(
      new RegExp(
        `.*Permissions based sync is not supported for appVersion: ${olderVersion}, must be ${PERMISSIONS_BASED_SYNC_MIN_APP_VERSION} or higher`,
      ),
    );
  });

  it('should return the changeCount, countries, and permissions in the sync', async function () {
    const response = await app.get('changes/metadata', {
      query: {
        appVersion: PERMISSIONS_BASED_SYNC_MIN_APP_VERSION,
      },
    });

    expect(response.statusCode).to.equal(200);
    const { changeCount, countries, permissionGroups } = response.body;
    expect(changeCount).to.be.a('number');
    expect(countries.sort()).to.eql(Object.keys(basicAccess));
    expect(permissionGroups.sort()).to.eql(Object.values(basicAccess).flat());
  });

  describe('permissions based syncing', () => {
    describe('initial sync', () => {
      it('should return the number of changes for a user with limited access', async function () {
        app.revokeAccess();
        await app.grantAccess({ [PERM_SYNC_COUNTRY_1.code]: [PERM_SYNC_PG_PUBLIC.name] });
        const response = await app.get('changes/metadata', {
          query: {
            appVersion: PERMISSIONS_BASED_SYNC_MIN_APP_VERSION,
            since: testStartTime,
          },
        });

        const { changeCount, countries, permissionGroups } = response.body;
        expect(changeCount).to.equal(20);
        expect(countries.sort()).to.eql([PERM_SYNC_COUNTRY_1.code]);
        expect(permissionGroups.sort()).to.eql([PERM_SYNC_PG_PUBLIC.name]);
      });

      it('should return the number of changes for a user with full access', async function () {
        app.revokeAccess();
        await app.grantAccess({
          [PERM_SYNC_COUNTRY_1.code]: [PERM_SYNC_PG_PUBLIC.name, PERM_SYNC_PG_ADMIN.name],
          [PERM_SYNC_COUNTRY_2.code]: [PERM_SYNC_PG_PUBLIC.name, PERM_SYNC_PG_ADMIN.name],
        });
        const response = await app.get('changes/metadata', {
          query: {
            appVersion: PERMISSIONS_BASED_SYNC_MIN_APP_VERSION,
            since: testStartTime,
          },
        });

        const { changeCount, countries, permissionGroups } = response.body;
        expect(changeCount).to.equal(29);
        expect(countries.sort()).to.eql([PERM_SYNC_COUNTRY_1.code, PERM_SYNC_COUNTRY_2.code]);
        expect(permissionGroups.sort()).to.eql([PERM_SYNC_PG_ADMIN.name, PERM_SYNC_PG_PUBLIC.name]);
      });
    });

    describe('subsequent syncs', () => {
      it('should sync previously unsynced data when given access to a new country', async function () {
        app.revokeAccess();
        await app.grantAccess({
          [PERM_SYNC_COUNTRY_1.code]: [PERM_SYNC_PG_PUBLIC.name],
          [PERM_SYNC_COUNTRY_2.code]: [PERM_SYNC_PG_PUBLIC.name], // Grant access to a previously unsynced country
        });
        const response = await app.get('changes/metadata', {
          query: {
            appVersion: PERMISSIONS_BASED_SYNC_MIN_APP_VERSION,
            since: dataImportedTime,
            countriesSynced: [PERM_SYNC_COUNTRY_1.code],
            permissionGroupsSynced: [PERM_SYNC_PG_PUBLIC.name],
          },
        });

        const { changeCount, countries } = response.body;
        expect(changeCount).to.equal(10);
        expect(countries.sort()).to.eql([PERM_SYNC_COUNTRY_1.code, PERM_SYNC_COUNTRY_2.code]);
      });

      it('should sync previously unsynced data when given access to a new permission group', async function () {
        app.revokeAccess();
        await app.grantAccess({
          // Grant access to a previously unsynced permission group
          [PERM_SYNC_COUNTRY_1.code]: [PERM_SYNC_PG_PUBLIC.name, PERM_SYNC_PG_ADMIN.name],
        });
        const response = await app.get('changes/metadata', {
          query: {
            appVersion: PERMISSIONS_BASED_SYNC_MIN_APP_VERSION,
            since: dataImportedTime,
            countriesSynced: [PERM_SYNC_COUNTRY_1.code],
            permissionGroupsSynced: [PERM_SYNC_PG_PUBLIC.name],
          },
        });

        const { changeCount, permissionGroups } = response.body;
        expect(changeCount).to.equal(5);
        expect(permissionGroups.sort()).to.eql([PERM_SYNC_PG_ADMIN.name, PERM_SYNC_PG_PUBLIC.name]);
      });

      it("should sync previously unsynced data when a survey's permission group changes", async function () {
        const startOfThisTest = Date.now();

        // Make survey4 have 'public' permissions
        const survey4 = testData.surveys.find(s => s.code === 'PERM_SYNC_SURVEY_4');
        const publicPermissionGroupId = testData.permissionGroups.find(
          pg => pg.name === PERM_SYNC_PG_PUBLIC.name,
        ).id;
        survey4.permission_group_id = publicPermissionGroupId;
        await survey4.save();

        await oneSecondSleep();
        await models.database.waitForAllChangeHandlers();

        app.revokeAccess();
        await app.grantAccess({
          [PERM_SYNC_COUNTRY_1.code]: [PERM_SYNC_PG_PUBLIC.name],
        });

        const response = await app.get('changes/metadata', {
          query: {
            appVersion: PERMISSIONS_BASED_SYNC_MIN_APP_VERSION,
            since: startOfThisTest,
            countriesSynced: [PERM_SYNC_COUNTRY_1.code],
            permissionGroupsSynced: [PERM_SYNC_PG_PUBLIC.name],
          },
        });

        const { changeCount } = response.body;
        expect(changeCount).to.equal(4);
      });

      it("should sync previously unsynced data when a survey's countries changes", async function () {
        const startOfThisTest = Date.now();

        // Make survey4 have 'public' permissions
        const survey3 = testData.surveys.find(s => s.code === 'PERM_SYNC_SURVEY_3');
        const country1Id = testData.countries.find(c => c.code === PERM_SYNC_COUNTRY_1.code).id;
        survey3.country_ids = [...survey3.country_ids, country1Id];
        await survey3.save();

        await oneSecondSleep();
        await models.database.waitForAllChangeHandlers();

        app.revokeAccess();
        await app.grantAccess({
          [PERM_SYNC_COUNTRY_1.code]: [PERM_SYNC_PG_ADMIN.name],
        });

        const response = await app.get('changes/metadata', {
          query: {
            appVersion: PERMISSIONS_BASED_SYNC_MIN_APP_VERSION,
            since: startOfThisTest,
            countriesSynced: [PERM_SYNC_COUNTRY_1.code],
            permissionGroupsSynced: [PERM_SYNC_PG_ADMIN.name],
          },
        });

        const { changeCount } = response.body;
        expect(changeCount).to.equal(6);
      });
    });
  });
});
