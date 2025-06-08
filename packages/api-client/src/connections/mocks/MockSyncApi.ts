import { Response as ExpressResponse } from 'express';
import { SyncApiInterface } from '../SyncApi';

export class MockSyncApi implements SyncApiInterface {
  public startSyncSession(): Promise<any> {
    throw new Error('Method not implemented.');
  }
  public endSyncSession(sessionId: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
  public pollStatusUntilReady(endpoint: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
  public initiatePull(
    sessionId: string,
    since: number,
    projectIds: string[],
    deviceId: string,
  ): Promise<any> {
    throw new Error('Method not implemented.');
  } 
  public pull(response: ExpressResponse, sessionId: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
