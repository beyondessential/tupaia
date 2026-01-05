import { subMinutes } from 'date-fns';

import { clearTestData, getTestModels } from '@tupaia/database';
import { FACT_CURRENT_SYNC_TICK } from '@tupaia/constants';

import { CentralSyncManager } from '../sync/CentralSyncManager';
import { SyncServerModelRegistry } from '../types';

describe('CentralSyncManager.queueDeviceForSync', () => {
  let centralSyncManager: CentralSyncManager;
  let models: any;

  const mockConfig = {
    maxConcurrentSessions: 1,
  };

  beforeAll(async () => {
    models = getTestModels() as SyncServerModelRegistry;
    await clearTestData(models.database);
  });

  beforeEach(async () => {
    centralSyncManager = new CentralSyncManager(models, mockConfig);

    await models.localSystemFact.set(FACT_CURRENT_SYNC_TICK, 1);

    // Clear any existing data
    await models.syncDeviceTick.delete({});
    await models.syncSession.delete({});
    await models.syncQueuedDevice.delete({});
  });

  const requestSync = async (
    deviceId: string,
    lastSyncedTick: number = 0,
    urgent: boolean = false,
  ) => {
    return centralSyncManager.queueDeviceForSync(`queue-${deviceId}`, urgent, lastSyncedTick);
  };

  const closeActiveSyncSessions = async () => {
    await models.syncSession.update({}, { completed_at: new Date() });
  };

  it('Should start a sync if the queue is empty', async () => {
    const result = await requestSync('A');
    expect(result).toHaveProperty('sessionId');
  });

  it('Should queue if a sync is running', async () => {
    const resultA = await requestSync('A');
    expect(resultA).toHaveProperty('sessionId');

    const resultB = await requestSync('B');
    // we're first in line (device A having been removed from the queue to start its sync)
    // but we are waiting for that sync to complete
    expect(resultB).toHaveProperty('status', 'activeSync');

    const resultC = await requestSync('C');
    // we're behind device B
    expect(resultC).toHaveProperty('status', 'waitingInQueue');
  });

  it('Should pick the oldest syncedTick device given uniform urgency', async () => {
    const resultA = await requestSync('A'); // start active sync
    expect(resultA).toHaveProperty('sessionId');

    // get some sessions in the queue
    await requestSync('B', 100);
    await requestSync('C', 200);
    await requestSync('D', 300);
    await requestSync('E', 10);

    await closeActiveSyncSessions();

    const waiting = await requestSync('D', 300);
    expect(waiting).toHaveProperty('status', 'waitingInQueue');

    const started = await requestSync('E', 10);
    expect(started).toHaveProperty('sessionId');
  });

  it('Should prioritise urgent over lastSyncedTick', async () => {
    const resultA = await requestSync('A'); // start active sync
    expect(resultA).toHaveProperty('sessionId');

    // get some sessions in the queue
    await requestSync('B', 100);
    await requestSync('C', 200);
    await requestSync('D', 300);
    await requestSync('E', 10);

    await closeActiveSyncSessions();

    const started = await requestSync('F', 400, true);
    expect(started).toHaveProperty('sessionId');
  });

  it('Should not overwrite urgent flag with non-urgent', async () => {
    const resultA = await requestSync('A'); // start active sync
    expect(resultA).toHaveProperty('sessionId');

    // get some sessions in the queue
    await requestSync('B', 100);
    await requestSync('C', 200, true);
    await requestSync('D', 300);
    await requestSync('E', 10);
    await requestSync('C', 200); // previous urgent flag should stick

    await closeActiveSyncSessions();

    const waiting = await requestSync('E', 10);
    expect(waiting).toHaveProperty('status', 'waitingInQueue');

    const started = await requestSync('C', 200); // non-urgent here but should still be urgent as sent previously for C
    expect(started).toHaveProperty('sessionId');
  });

  it('Should cancel a session if that device re-queues', async () => {
    const resultA = await requestSync('A'); // start active sync
    expect(resultA).toHaveProperty('sessionId');

    await requestSync('B', 100);
    await requestSync('C', 200, true); // this one will be at the front
    await requestSync('D', 300);
    await requestSync('E', 10);

    const resultTerminate = await requestSync('A', 100);
    // I had a session but it was terminated - now I'm just a regular part of the queue
    expect(resultTerminate).toHaveProperty('status', 'waitingInQueue');

    const started = await requestSync('C', 200); // new front-of-queue should succeed
    expect(started).toHaveProperty('sessionId');
  });

  it('Should exclude an old session from the queue', async () => {
    const resultA = await requestSync('A'); // start active sync
    expect(resultA).toHaveProperty('sessionId');

    await requestSync('B', 100);
    await requestSync('C', 200, true);

    // wrap up the A session so that B and C can compete for next spot
    await closeActiveSyncSessions();

    // B should be waiting behind C
    const resultCheck = await requestSync('B', 100);
    expect(resultCheck).toHaveProperty('status', 'waitingInQueue');

    // now grab the queue record for C and backdate it to ages ago
    const queuedDeviceC = await models.syncQueuedDevice.findById('queue-C');
    queuedDeviceC.last_seen_time = subMinutes(new Date(), 300);
    await queuedDeviceC.save();

    // now our B device should be at the front of the queue
    const started = await requestSync('B', 200);
    expect(started).toHaveProperty('sessionId');
  });
});
