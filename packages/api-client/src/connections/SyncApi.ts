import { Response as ExpressResponse } from 'express';

import { sleep } from '@tupaia/utils';

import { BaseApi } from './BaseApi';
import { PublicInterface } from './types';

export class SyncApi extends BaseApi {
  async startSyncSession() {
    // start a sync session
    const { sessionId } = await this.connection.post('sync');

    // TODO: Implement sync queue RN-1667

    // then, poll the sync/:sessionId/status endpoint until we get a valid response
    // this is because POST /sync (especially the tickTockGlobalClock action) might get blocked
    // and take a while if the central server is concurrently persist records from another client
    await this.pollStatusUntil(`sync/${sessionId}/status`, 'ready');

    // finally, fetch the new tick from starting the session
    const { startedAtTick } = await this.connection.get(`sync/${sessionId}/metadata`, {});

    return { sessionId, startedAtTick };
  }

  async endSyncSession(sessionId: string) {
    return this.connection.delete(`sync/${sessionId}`);
  }

  async pollStatusUntil(endpoint: string, status: string): Promise<void> {
    // poll the provided endpoint until we get a valid response
    const waitTime = 1000; // retry once per second
    const maxAttempts = 60 * 60 * 12; // for a maximum of 12 hours
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const response = await this.connection.get(endpoint, {});
      if (response.status === status) {
        return response;
      }
      await sleep(waitTime);
    }
    throw new Error(`Did not get a truthy response after ${maxAttempts} attempts for ${endpoint}`);
  }

  async initiatePull(sessionId: string, since: number, projectIds: string[], deviceId: string) {
    // first, set the pull filter on the central server,
    // which will kick off a snapshot of changes to pull
    const data = { since, projectIds, deviceId };
    await this.connection.post(`sync/${sessionId}/pull`, {}, data);

    // then, poll the pull/status endpoint until we get a valid response - it takes a while for
    // pull/status to finish populating the snapshot of changes
    await this.pollStatusUntil(`sync/${sessionId}/pull/status`, 'ready');

    // finally, fetch the metadata for the changes we're about to pull
    return this.connection.get(`sync/${sessionId}/pull/metadata`);
  }

  async pull(response: ExpressResponse, sessionId: string) {
    return this.connection.pipeStream(response, `sync/${sessionId}/pull`);
  }

  async push(sessionId: string, changes: any[]) {
    return this.connection.post(`sync/${sessionId}/push`, {}, { changes });
  }

  async completePush(sessionId: string, deviceId: string) {
    // first off, mark the push as complete on central
    await this.connection.put(`sync/${sessionId}/push/complete`, {}, { deviceId });

    // now poll the complete check endpoint until we get a valid response - it takes a while for
    // the pushed changes to finish persisting to the central database
    await this.pollStatusUntil(`sync/${sessionId}/push/status`, 'complete');
  }
}

export interface SyncApiInterface extends PublicInterface<SyncApi> {}