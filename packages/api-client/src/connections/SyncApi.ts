import { sleep } from '@tupaia/utils';

import { BaseApi } from './BaseApi';
import { PublicInterface } from './types';
import { Response as ExpressResponse } from 'express';

export class SyncApi extends BaseApi {
  async startSyncSession() {
    // start a sync session
    const { sessionId } = await this.connection.post('sync');

    // TODO: Implement sync queue RN-1667

    // then, poll the sync/:sessionId/status endpoint until we get a valid response
    // this is because POST /sync (especially the tickTockGlobalClock action) might get blocked
    // and take a while if the central server is concurrently persist records from another client
    await this.pollStatusUntilReady(`sync/${sessionId}/status`);

    // finally, fetch the new tick from starting the session
    const { startedAtTick } = await this.connection.get(`sync/${sessionId}/metadata`, {});

    return { sessionId, startedAtTick };
  }

  async endSyncSession(sessionId: string) {
    return this.connection.delete(`sync/${sessionId}`);
  }

  async pollStatusUntilReady(endpoint: string): Promise<void> {
    // poll the provided endpoint until we get a valid response
    const waitTime = 1000; // retry once per second
    const maxAttempts = 60 * 60 * 12; // for a maximum of 12 hours
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const response = await this.connection.get(endpoint, {});
      if (response.status === 'ready') {
        return response;
      }
      await sleep(waitTime);
    }
    throw new Error(`Did not get a truthy response after ${maxAttempts} attempts for ${endpoint}`);
  }

  async initiatePull(sessionId: string, since: number, projectIds: string[], deviceId: string) {
    // first, set the pull filter on the central server,
    // which will kick of a snapshot of changes to pull
    const data = { since, projectIds, deviceId };
    await this.connection.post(`sync/${sessionId}/pull`, {}, data);

    // then, poll the pull/status endpoint until we get a valid response - it takes a while for
    // pull/status to finish populating the snapshot of changes
    await this.pollStatusUntilReady(`sync/${sessionId}/pull/status`);

    // finally, fetch the metadata for the changes we're about to pull
    return this.connection.get(`sync/${sessionId}/pull/metadata`);
  }

  async pull(response: ExpressResponse, sessionId: string) {
    return this.connection.pipeStream(response, `sync/${sessionId}/pull`);
  }
}

export interface SyncApiInterface extends PublicInterface<SyncApi> {}
