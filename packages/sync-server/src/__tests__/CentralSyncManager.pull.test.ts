import { clearTestData, getTestModels, findOrCreateDummyRecord } from '@tupaia/database';
import {
  BES_ADMIN_PERMISSION_GROUP,
  FACT_CURRENT_SYNC_TICK,
  FACT_LOOKUP_UP_TO_TICK,
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
} from '@tupaia/constants';
import {
  findSyncSnapshotRecords,
  SYNC_SESSION_DIRECTION,
  SyncSnapshotAttributes,
} from '@tupaia/sync';
import { sleep } from '@tupaia/utils';
import { AccessPolicy } from '@tupaia/access-policy';
import { CountryRecord, EntityHierarchyRecord, ProjectRecord, UserRecord } from '@tupaia/server-boilerplate';

import { CentralSyncManager } from '../sync';
import { waitForPushComplete, waitForSession } from '../testUtilities/waitForSync';
import { TestSyncServerModelRegistry } from '../types';

const POLICY = {
  DL: [BES_ADMIN_PERMISSION_GROUP, 'Admin'],
  KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
};

describe('CentralSyncManager.pull', () => {
  describe('handles concurrent transactions', () => {
    let models: TestSyncServerModelRegistry;
    let country: CountryRecord;
    let userAccount: UserRecord;
    let entityHierarchy: EntityHierarchyRecord;
    let project: ProjectRecord;

    const prepareSnapshotBlocking = async () => {
      let markSnapshotBlockingReady: () => Promise<void>;
      const snapshotBlockingReadyPromise = new Promise(resolve => {
        markSnapshotBlockingReady = async () => resolve(true);
      });

      // Build the fakeModelPromise so that it can block the snapshotting process,
      // then we can insert some new records while snapshotting is happening
      let unblockSnapshot!: () => Promise<void>;
      const unblockSnapshotPromise = new Promise(resolve => {
        // count: 100 is not correct but shouldn't matter in this test case
        unblockSnapshot = async () =>
          resolve({
            id: {},
            name: {},
          });
      });
      const pauseSnapshotProcess = async () => {
        await markSnapshotBlockingReady();
        await unblockSnapshotPromise;
      };

      return {
        pauseSnapshotProcess,
        unblockSnapshot,
        snapshotBlockingReadyPromise,
      };
    };

    const prepareData = async () => {
      userAccount = await findOrCreateDummyRecord(models.user, {
        email: 'test_user_account@email.com',
        first_name: 'Test',
        last_name: 'User Account',
      });
      country = await findOrCreateDummyRecord(models.country, { code: 'test_country' });
      entityHierarchy = await findOrCreateDummyRecord(models.entityHierarchy, {
        name: 'test_entity_hierarchy',
        canonical_types: '{country}',
      });
      project = await findOrCreateDummyRecord(models.project, {
        code: 'test_project',
        description: 'Test Project',
        entity_hierarchy_id: entityHierarchy.id,
      });

      return {
        country,
        userAccount,
        entityHierarchy,
        project,
      };
    };

    beforeAll(async () => {
      models = getTestModels() as TestSyncServerModelRegistry;
      await clearTestData(models.database);
    });

    beforeEach(async () => {
      await models.localSystemFact.set(FACT_CURRENT_SYNC_TICK, 4);
      await models.localSystemFact.set(FACT_LOOKUP_UP_TO_TICK, -1);
      await models.syncLookup.delete({});
      await models.syncDeviceTick.delete({});
      await models.syncSession.delete({});
      await models.syncQueuedDevice.delete({});

      jest.resetModules();
      jest.clearAllMocks();
    });

    it('excludes manually inserted records when main snapshot transaction already started', async () => {
      await models.localSystemFact.set(FACT_CURRENT_SYNC_TICK, 4);
      await models.localSystemFact.set(FACT_LOOKUP_UP_TO_TICK, -1);
      const { country, userAccount, entityHierarchy, project } = await prepareData();

      // Build the fakeModelPromise so that it can block the snapshotting process,
      // then we can insert some new records while snapshotting is happening
      const { unblockSnapshot, snapshotBlockingReadyPromise, pauseSnapshotProcess } =
        await prepareSnapshotBlocking();

      const centralSyncManager = new CentralSyncManager(models, { pauseSnapshotProcess });
      await centralSyncManager.updateLookupTable();

      const { sessionId } = await centralSyncManager.startSession();
      await waitForSession(centralSyncManager, sessionId);

      // Start the snapshot process
      const snapshot = centralSyncManager.setupSnapshotForPull(
        sessionId,
        {
          since: 1,
          userId: userAccount.id,
          deviceId: 'test-device-id',
          projectIds: [project.id],
        },
        () => Promise.resolve(),
        new AccessPolicy(POLICY),
      );

      // wait until setupSnapshotForPull() reaches pauseSnapshotProcess() in CentralSyncManager
      // and block the snapshotting process
      await snapshotBlockingReadyPromise;

      // Insert the records just before we release the lock,
      // meaning that we're inserting the records below in the middle of the snapshotting process,
      // and they SHOULD NOT be included in the snapshot
      await findOrCreateDummyRecord(models.entity, {
        code: 'test_entity',
        name: 'Test Entity',
        type: 'village',
      });
      await findOrCreateDummyRecord(models.entity, {
        code: 'test_entity2',
        name: 'Test Entity 2',
        type: 'facility',
      });
      await centralSyncManager.updateLookupTable();

      await sleep(100);

      // Now release the lock to see if the snapshot captures the newly inserted records above
      await unblockSnapshot();
      await sleep(20);

      await snapshot;

      // Check if only 3 pre inserted records were snapshotted
      // and not the ones that were inserted in the middle of the snapshot process
      const snapshotRecords = await findSyncSnapshotRecords(
        models.database,
        sessionId,
        undefined,
        undefined,
        undefined,
        SYNC_SESSION_DIRECTION.OUTGOING,
      );

      expect(snapshotRecords.length).toBe(4);
      expect(snapshotRecords.map(r => r.recordId).sort()).toEqual(
        [country, userAccount, entityHierarchy, project].map(r => r.id).sort(),
      );
    });

    it("excludes inserted records from another sync session when the current' session's snapshot transaction already started", async () => {
      await models.localSystemFact.set(FACT_CURRENT_SYNC_TICK, 4);
      await models.localSystemFact.set(FACT_LOOKUP_UP_TO_TICK, -1);
      const { country, userAccount, entityHierarchy, project } = await prepareData();

      // Build the fakeModelPromise so that it can block the snapshotting process,
      // then we can insert some new records while snapshotting is happening
      const { unblockSnapshot, snapshotBlockingReadyPromise, pauseSnapshotProcess } =
        await prepareSnapshotBlocking();

      const centralSyncManager = new CentralSyncManager(models, { pauseSnapshotProcess });
      await centralSyncManager.updateLookupTable();

      const { sessionId: sessionIdOne } = await centralSyncManager.startSession();
      await waitForSession(centralSyncManager, sessionIdOne);

      // Start the snapshot process
      const snapshot = centralSyncManager.setupSnapshotForPull(
        sessionIdOne,
        {
          since: 1,
          userId: userAccount.id,
          deviceId: 'test-device-id',
          projectIds: [project.id],
        },
        () => Promise.resolve(),
        new AccessPolicy(POLICY),
      );

      // wait until setupSnapshotForPull() reaches pauseSnapshotProcess() in CentralSyncManager
      // and block the snapshotting process
      await snapshotBlockingReadyPromise;

      // Insert the records just before we release the lock,
      // meaning that we're inserting the records below in the middle of the snapshotting process,
      // and they SHOULD NOT be included in the snapshot

      const { sessionId: sessionIdTwo } = await centralSyncManager.startSession();
      await waitForSession(centralSyncManager, sessionIdTwo);

      const userAccount2 = await findOrCreateDummyRecord(models.user, {
        email: 'new_user_session2@email.com',
        first_name: 'New',
        last_name: 'User Session 2',
      });
      const userAccount3 = await findOrCreateDummyRecord(models.user, {
        email: 'new_user_session3@email.com',
        first_name: 'New',
        last_name: 'User Session 3',
      });
      const userAccount4 = await findOrCreateDummyRecord(models.user, {
        email: 'new_user_session4@email.com',
        first_name: 'New',
        last_name: 'User Session 4',
      });

      const sessionTwoChanges = [
        {
          direction: SYNC_SESSION_DIRECTION.OUTGOING,
          isDeleted: false,
          recordType: 'user_account',
          recordId: userAccount2.id,
          data: await userAccount2.getData(),
        },
        {
          direction: SYNC_SESSION_DIRECTION.OUTGOING,
          isDeleted: false,
          recordType: 'user_account',
          recordId: userAccount3.id,
          data: await userAccount3.getData(),
        },
        {
          direction: SYNC_SESSION_DIRECTION.OUTGOING,
          isDeleted: false,
          recordType: 'user_account',
          recordId: userAccount4.id,
          data: await userAccount4.getData(),
        },
      ] as SyncSnapshotAttributes[];
      await centralSyncManager.addIncomingChanges(sessionIdTwo, sessionTwoChanges);
      await centralSyncManager.completePush(sessionIdTwo, 'test-device-id-2');
      await waitForPushComplete(centralSyncManager, sessionIdTwo);
      await centralSyncManager.updateLookupTable();

      await sleep(100);

      // Now release the lock to see if the snapshot captures the newly inserted records above
      await unblockSnapshot();
      await sleep(20);

      await snapshot;

      // Check if only 3 pre inserted records were snapshotted
      // and not the ones that were inserted in the middle of the snapshot process
      const snapshotRecords = await findSyncSnapshotRecords(
        models.database,
        sessionIdOne,
        undefined,
        undefined,
        undefined,
        SYNC_SESSION_DIRECTION.OUTGOING,
      );

      expect(snapshotRecords.length).toBe(4);
      expect(snapshotRecords.map(r => r.recordId).sort()).toEqual(
        [country, userAccount, entityHierarchy, project].map(r => r.id).sort(),
      );
    });
  });
});
