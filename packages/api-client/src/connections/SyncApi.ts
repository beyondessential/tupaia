import { Response as ExpressResponse } from 'express';

import { BaseApi } from './BaseApi';
import { PublicInterface } from './types';

export class SyncApi extends BaseApi {
  async startSyncSession() {
    // start a sync session
    return this.connection.post('sync');
  }

  async checkSessionReady(sessionId: string) {
    return this.connection.get(`sync/${sessionId}/status`);
  }

  async getSessionMetadata(sessionId: string) {
    return this.connection.get(`sync/${sessionId}/metadata`, {});
  }

  async endSyncSession(sessionId: string) {
    return this.connection.delete(`sync/${sessionId}`);
  }

  async initiatePull(sessionId: string, since: number, projectIds: string[], deviceId: string) {
    const data = { since, projectIds, deviceId };
    return this.connection.post(`sync/${sessionId}/pull`, {}, data);
  }

  async checkPullStatus(sessionId: string) {
    return this.connection.get(`sync/${sessionId}/pull/status`, {});
  }

  async getPullMetadata(sessionId: string) {
    return this.connection.get(`sync/${sessionId}/pull/metadata`, {});
  }

  async pull(response: ExpressResponse, sessionId: string) {
    return this.connection.pipeStream(response, `sync/${sessionId}/pull`);
  }

  async push(sessionId: string, changes: any[]) {
    return this.connection.post(`sync/${sessionId}/push`, {}, { changes });
  }

  async completePush(sessionId: string, deviceId: string) {
    return this.connection.put(`sync/${sessionId}/push/complete`, {}, { deviceId });
  }

  async checkPushStatus(sessionId: string) {
    return this.connection.get(`sync/${sessionId}/push/status`, {});
  }
}

export interface SyncApiInterface extends PublicInterface<SyncApi> {}
