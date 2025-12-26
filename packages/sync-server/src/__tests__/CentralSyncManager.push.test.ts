import {
  generateId,
  clearTestData,
  getTestModels,
  findOrCreateDummyRecord,
} from '@tupaia/database';
import { FACT_CURRENT_SYNC_TICK, FACT_LOOKUP_UP_TO_TICK } from '@tupaia/constants';
import { createSnapshotTable, SYNC_SESSION_DIRECTION, SyncSnapshotAttributes } from '@tupaia/sync';
import { sleep } from '@tupaia/utils';

import { CentralSyncManager } from '../sync';

describe('CentralSyncManager.push', () => {
  let models: any;
  let sessionId: string;

  const waitForSession = async (centralSyncManager: CentralSyncManager, sessionId: string) => {
    let ready = false;
    while (!ready) {
      ready = await centralSyncManager.checkSessionReady(sessionId);
      await sleep(100);
    }
  };

  const waitForPushComplete = async (centralSyncManager: CentralSyncManager, sessionId: string) => {
    let ready = false;
    while (!ready) {
      ready = await centralSyncManager.checkPushComplete(sessionId);
      await sleep(100);
    }
  };

  beforeAll(async () => {
    models = getTestModels();
    await clearTestData(models.database);
  });

  beforeEach(async () => {
    sessionId = generateId();
    const startTime = new Date();
    await models.syncSession.create({
      id: sessionId,
      startTime,
      lastConnectionTime: startTime,
      debugInfo: {},
    });
    await createSnapshotTable(models.database, sessionId);
    await models.syncLookup.delete({});
    await models.localSystemFact.set(FACT_CURRENT_SYNC_TICK, 4);
    await models.localSystemFact.set(FACT_LOOKUP_UP_TO_TICK, -1);
    await models.syncDeviceTick.delete({});
    await models.syncSession.delete({});
    await models.syncQueuedDevice.delete({});

    jest.resetModules();
    jest.clearAllMocks();
  });

  it('inserts incoming changes into snapshots', async () => {
    const userAccount1 = await findOrCreateDummyRecord(models.user, {
      email: 'user_account1@email.com',
      first_name: 'User',
      last_name: 'Account 1',
    });
    const userAccount2 = await findOrCreateDummyRecord(models.user, {
      email: 'user_account2@email.com',
      first_name: 'User',
      last_name: 'Account 2',
    });
    const changes = [userAccount1, userAccount2].map(r => ({
      direction: SYNC_SESSION_DIRECTION.OUTGOING,
      isDeleted: !!r.deletedAt,
      recordType: 'user_account',
      recordId: r.id,
      data: r.dataValues,
    })) as SyncSnapshotAttributes[];

    const centralSyncManager = new CentralSyncManager(models);

    const { sessionId } = await centralSyncManager.startSession();
    await waitForSession(centralSyncManager, sessionId);

    await centralSyncManager.addIncomingChanges(sessionId, changes);

    await centralSyncManager.completePush(sessionId, 'device_id');
    await waitForPushComplete(centralSyncManager, sessionId);

    await centralSyncManager.updateLookupTable();

    const syncLookupTable = await models.syncLookup.find({ record_type: 'user_account' });
    expect(syncLookupTable.length).toEqual(2);
    expect(syncLookupTable.map((r: any) => r.record_id)).toEqual([
      userAccount1.id,
      userAccount2.id,
    ]);
  });
});
