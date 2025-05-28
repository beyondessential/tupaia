import { stream, syncGet, syncPost, syncRemove } from '../api';
import { sleepAsync } from '../utils';

export class CentralServerConnection {
  private deviceId: string;

  constructor(deviceId: string) {
    this.deviceId = deviceId;
  }

  async startSyncSession({ lastSyncedTick }) {
    // start a sync session (or refresh our position in the queue)
    const { sessionId, status } = await syncPost('sync', {
      lastSyncedTick,
    });

    if (!sessionId) {
      // we're waiting in a queue
      return { status };
    }

    // then, poll the sync/:sessionId/ready endpoint until we get a valid response
    // this is because POST /sync (especially the tickTockGlobalClock action) might get blocked
    // and take a while if the central server is concurrently persist records from another client
    await this.pollUntilTrue(`sync/${sessionId}/ready`);

    // finally, fetch the new tick from starting the session
    const { startedAtTick } = await syncGet(`sync/${sessionId}/metadata`, {});

    return { sessionId, startedAtTick };
  }

  async endSyncSession(sessionId) {
    return syncRemove(`sync/${sessionId}`);
  }

  async pollUntilTrue(endpoint: string): Promise<void> {
    // poll the provided endpoint until we get a valid response
    const waitTime = 1000; // retry once per second
    const maxAttempts = 60 * 60 * 12; // for a maximum of 12 hours
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const response = await syncGet(endpoint, {});
      if (response) {
        return response;
      }
      await sleepAsync(waitTime);
    }
    throw new Error(`Did not get a truthy response after ${maxAttempts} attempts for ${endpoint}`);
  }

  async initiatePull(sessionId, since, projectIds) {
    // first, set the pull filter on the central server, which will kick of a snapshot of changes
    // to pull
    const data = { since, projectIds, deviceId: this.deviceId };
    await syncPost(`sync/${sessionId}/pull/initiate`, { data });

    // then, poll the pull/ready endpoint until we get a valid response - it takes a while for
    // pull/initiate to finish populating the snapshot of changes
    await this.pollUntilTrue(`sync/${sessionId}/pull/ready`);

    // finally, fetch the metadata for the changes we're about to pull
    return syncGet(`sync/${sessionId}/pull/metadata`);
  }

  async pull(sessionId) {
    return stream(`sync/${sessionId}/pull`);
  }
}
