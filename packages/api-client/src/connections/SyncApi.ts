import { sleepAsync } from '@tupaia/utils';
import { ExpressResponse } from '@tupaia/server-boilerplate';

import { BaseApi } from './BaseApi';
import { PublicInterface } from './types';

export class SyncApi extends BaseApi {
  async startSyncSession(lastSyncedTick: number) {
    // start a sync session (or refresh our position in the queue)
    const { sessionId, status } = await this.connection.post('sync', {}, {
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
    const { startedAtTick } = await this.connection.get(`sync/${sessionId}/metadata`, {});

    return { sessionId, startedAtTick };
  }

  async endSyncSession(sessionId: string) {
    return this.connection.delete(`sync/${sessionId}`);
  }

  async pollUntilTrue(endpoint: string): Promise<void> {
    // poll the provided endpoint until we get a valid response
    const waitTime = 1000; // retry once per second
    const maxAttempts = 60 * 60 * 12; // for a maximum of 12 hours
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const response = await this.connection.get(endpoint, {});
      if (response) {
        return response;
      }
      await sleepAsync(waitTime);
    }
    throw new Error(`Did not get a truthy response after ${maxAttempts} attempts for ${endpoint}`);
  }

  async initiatePull(sessionId: string, since: number, projectIds: string[], deviceId: string) {
    // first, set the pull filter on the central server, which will kick of a snapshot of changes
    // to pull
    const data = { since, projectIds, deviceId };
    await this.connection.post(`sync/${sessionId}/pull/initiate`, {}, data);

    // then, poll the pull/ready endpoint until we get a valid response - it takes a while for
    // pull/initiate to finish populating the snapshot of changes
    await this.pollUntilTrue(`sync/${sessionId}/pull/ready`);

    // finally, fetch the metadata for the changes we're about to pull
    return this.connection.get(`sync/${sessionId}/pull/metadata`);
  }
}

export interface SyncApiInterface extends PublicInterface<SyncApi> {}
