import { sleep } from '@tupaia/utils';
import { CentralSyncManager } from '../sync';

const POLL_INTERVAL_MS = 100;
const TIMEOUT_MS = 10_000;

export const waitForSession = async (centralSyncManager: CentralSyncManager, sessionId: string) => {
  const deadline = Date.now() + TIMEOUT_MS;
  let ready = false;
  while (!ready) {
    ready = await centralSyncManager.checkSessionReady(sessionId);
    if (!ready) {
      if (Date.now() >= deadline) {
        throw new Error(`waitForSession timed out after ${TIMEOUT_MS}ms for session ${sessionId}`);
      }
      await sleep(POLL_INTERVAL_MS);
    }
  }
};

export const waitForPushComplete = async (
  centralSyncManager: CentralSyncManager,
  sessionId: string,
) => {
  const deadline = Date.now() + TIMEOUT_MS;
  let ready = false;
  while (!ready) {
    ready = await centralSyncManager.checkPushComplete(sessionId);
    if (!ready) {
      if (Date.now() >= deadline) {
        throw new Error(
          `waitForPushComplete timed out after ${TIMEOUT_MS}ms for session ${sessionId}`,
        );
      }
      await sleep(POLL_INTERVAL_MS);
    }
  }
};
