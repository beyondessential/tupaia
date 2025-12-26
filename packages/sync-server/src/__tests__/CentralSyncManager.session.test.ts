import { cloneDeep } from 'lodash';

import { generateId, clearTestData, getTestModels } from '@tupaia/database';
import { FACT_CURRENT_SYNC_TICK, FACT_LOOKUP_UP_TO_TICK } from '@tupaia/constants';
import { createSnapshotTable } from '@tupaia/sync';
import { sleep } from '@tupaia/utils';

import { CentralSyncManager } from '../sync';

const DEFAULT_CURRENT_SYNC_TIME_VALUE = 2;

describe('CentralSyncManager.session', () => {
  const expectMatchingSessionData = (sessionData1: any, sessionData2: any) => {
    const cleanedSessionData1 = { ...sessionData1 };
    const cleanedSessionData2 = { ...sessionData2 };

    // Remove updatedAt and lastConnectionTime as these fields change on every connect, so they return false negatives when comparing session data
    delete cleanedSessionData1.updatedAt;
    delete cleanedSessionData2.updatedAt;
    delete cleanedSessionData1.lastConnectionTime;
    delete cleanedSessionData2.lastConnectionTime;

    expect(cleanedSessionData1).toEqual(cleanedSessionData2);
  };

  let models: any;
  let sessionId: string;

  const waitForSession = async (centralSyncManager: CentralSyncManager, sessionId: string) => {
    let ready = false;
    while (!ready) {
      ready = await centralSyncManager.checkSessionReady(sessionId);
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

  describe('startSession', () => {
    it('creates a new session', async () => {
      const centralSyncManager = new CentralSyncManager(models);
      const { sessionId } = await centralSyncManager.startSession();
      await waitForSession(centralSyncManager, sessionId);

      const syncSession = await models.syncSession.findById(sessionId);
      expect(syncSession).not.toBeUndefined();
    });

    it('tick-tocks the global clock', async () => {
      const centralSyncManager = new CentralSyncManager(models);
      const { sessionId } = await centralSyncManager.startSession();

      await waitForSession(centralSyncManager, sessionId);

      const localSystemFact = await models.localSystemFact.findOne({
        where: { key: FACT_CURRENT_SYNC_TICK },
      });
      expect(parseInt(localSystemFact.value, 10)).toBe(DEFAULT_CURRENT_SYNC_TIME_VALUE + 2);
    });

    it('allows concurrent sync sessions', async () => {
      const centralSyncManager = new CentralSyncManager(models);
      const { sessionId: sessionId1 } = await centralSyncManager.startSession();
      const { sessionId: sessionId2 } = await centralSyncManager.startSession();

      await waitForSession(centralSyncManager, sessionId1);
      await waitForSession(centralSyncManager, sessionId2);

      const syncSession1 = await models.syncSession.findById(sessionId1);
      const syncSession2 = await models.syncSession.findById(sessionId2);

      expect(syncSession1).not.toBeUndefined();
      expect(syncSession2).not.toBeUndefined();
    });

    it('throws an error if the sync lookup table has not yet built', async () => {
      const centralSyncManager = new CentralSyncManager(models);
      const { sessionId } = await centralSyncManager.startSession();
      await expect(waitForSession(centralSyncManager, sessionId)).rejects.toThrow(
        `Sync session '${sessionId}' encountered an error: Sync lookup table has not yet built. Cannot initiate sync.`,
      );
    });

    it('throws an error when checking a session is ready if it never assigned a started_at_tick', async () => {
      const fakeMarkAsStartedAt = () => {
        // Do nothing and ensure we error out when the client starts polling
      };

      const spyMarkAsStartedAt = jest
        .spyOn(models.syncSession.prototype, 'markAsStartedAt')
        .mockImplementation(fakeMarkAsStartedAt);

      const centralSyncManager = new CentralSyncManager(models);
      const { sessionId } = await centralSyncManager.startSession();

      await expect(waitForSession(centralSyncManager, sessionId))
        .rejects.toThrow(
          new RegExp(
            `Sync session '${sessionId}' encountered an error: Session initiation incomplete, likely because the central server restarted during the process`,
          ),
        )
        .finally(() => spyMarkAsStartedAt.mockRestore());
    });

    /**
     * Since the client is polling to see if the session has started, its important we only mark as started once everything is complete
     */
    it('performs no further operations after flagging the session as started', async () => {
      const centralSyncManager = new CentralSyncManager(models);
      const originalPrepareSession = centralSyncManager.prepareSession.bind(centralSyncManager);
      let dataValuesAtStartTime = null;

      const fakeCentralSyncManagerPrepareSession = async (sessionId: string) => {
        const originalMarkAsStartedAt = models.syncSession.markAsStartedAt.bind(sessionId);
        const fakeSessionMarkAsStartedAt = async (id: string, tick: any) => {
          const result = await originalMarkAsStartedAt(tick);
          dataValuesAtStartTime = cloneDeep(await models.syncSession.findById(id)); // Save dataValues immediately after marking session as started
          return result;
        };
        jest
          .spyOn(models.syncSession.prototype, 'markAsStartedAt')
          .mockImplementation(fakeSessionMarkAsStartedAt as any);
        return originalPrepareSession(sessionId);
      };

      jest
        .spyOn(centralSyncManager, 'prepareSession')
        .mockImplementation(fakeCentralSyncManagerPrepareSession);

      const { sessionId } = await centralSyncManager.startSession();

      await waitForSession(centralSyncManager, sessionId);
      const latestValues = (await models.syncSession.findOne({ where: { id: sessionId } }))
        .dataValues;

      expectMatchingSessionData(latestValues, dataValuesAtStartTime);
    });
  });

  describe('connectToSession', () => {
    it('allows connecting to an existing session', async () => {
      const centralSyncManager = new CentralSyncManager(models);
      const { sessionId } = await centralSyncManager.startSession();
      await waitForSession(centralSyncManager, sessionId);

      const syncSession = await centralSyncManager.connectToSession(sessionId);
      expect(syncSession).toBeDefined();
    });

    it('throws an error if connecting to a session that has errored out', async () => {
      const centralSyncManager = new CentralSyncManager(models);
      const { sessionId } = await centralSyncManager.startSession();
      await waitForSession(centralSyncManager, sessionId);

      await models.syncSession.markSessionErrored(
        sessionId,
        'Snapshot processing incomplete, likely because the central server restarted during the snapshot',
      );

      await expect(centralSyncManager.connectToSession(sessionId)).rejects.toThrow(
        `Sync session '${sessionId}' encountered an error: Snapshot processing incomplete, likely because the central server restarted during the snapshot`,
      );
    });

    it("does not throw an error when connecting to a session that has not taken longer than configured 'syncSessionTimeoutMs'", async () => {
      const centralSyncManager = new CentralSyncManager(models, { syncSessionTimeoutMs: 1000 });

      const { sessionId } = await centralSyncManager.startSession();
      await waitForSession(centralSyncManager, sessionId);

      // updated_at will be set to timestamp that is 500ms later
      await centralSyncManager.connectToSession(sessionId);

      expect(() => centralSyncManager.connectToSession(sessionId)).not.toThrow();
    });

    it("throws an error when connecting to a session that has taken longer than configured 'syncSessionTimeoutMs'", async () => {
      const centralSyncManager = new CentralSyncManager(models);
      const { sessionId } = await centralSyncManager.startSession();
      await waitForSession(centralSyncManager, sessionId);

      // updated_at will be set to timestamp that is 500ms later
      await centralSyncManager.connectToSession(sessionId);

      await expect(centralSyncManager.connectToSession(sessionId)).rejects.toThrow(
        `Sync session '${sessionId}' encountered an error: Sync session ${sessionId} timed out`,
      );
    });

    it('append error if sync session already encounters an error before', async () => {
      const centralSyncManager = new CentralSyncManager(models);
      const { sessionId } = await centralSyncManager.startSession();
      await waitForSession(centralSyncManager, sessionId);

      await models.syncSession.markSessionErrored(sessionId, 'Error 1');
      await models.syncSession.markSessionErrored(sessionId, 'Error 2');

      expect((await models.syncSession.findById(sessionId)).errors).toEqual(['Error 1', 'Error 2']);
    });
  });

  describe('endSession', () => {
    it('set completedAt when ending an existing session', async () => {
      const centralSyncManager = new CentralSyncManager(models);
      const { sessionId } = await centralSyncManager.startSession();
      await waitForSession(centralSyncManager, sessionId);

      await centralSyncManager.endSession(sessionId);
      const syncSession2 = await models.syncSession.findOne({ where: { id: sessionId } });
      expect(syncSession2.completedAt).not.toBeUndefined();
    });

    it('throws an error when connecting to a session that already ended', async () => {
      const centralSyncManager = new CentralSyncManager(models);
      const { sessionId } = await centralSyncManager.startSession();
      await waitForSession(centralSyncManager, sessionId);

      await centralSyncManager.endSession(sessionId);
      await expect(centralSyncManager.connectToSession(sessionId)).rejects.toThrow();
    });
  });
});
