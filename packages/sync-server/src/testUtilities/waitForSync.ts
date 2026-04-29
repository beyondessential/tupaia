import { sleep } from '@tupaia/utils';
import { CentralSyncManager } from '../sync';

export const waitForSession = async (centralSyncManager: CentralSyncManager, sessionId: string) => {
  let ready = false;
  while (!ready) {
    ready = await centralSyncManager.checkSessionReady(sessionId);
    await sleep(100);
  }
};

export const waitForPushComplete = async (
  centralSyncManager: CentralSyncManager,
  sessionId: string,
) => {
  let ready = false;
  while (!ready) {
    ready = await centralSyncManager.checkPushComplete(sessionId);
    await sleep(100);
  }
};
