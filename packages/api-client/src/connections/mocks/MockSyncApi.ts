import { Response as ExpressResponse } from 'express';
import { SyncApiInterface } from '../SyncApi';

export class MockSyncApi implements SyncApiInterface {
  public startSyncSession(res: ExpressResponse): Promise<any> {
    throw new Error('Method not implemented.');
  }
  public endSyncSession(sessionId: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
  public pollStatusUntil(
    res: ExpressResponse,
    endpoint: string,
    status: string,
    getWaitingMessage: () => Buffer,
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }
  public initiatePull(
    res: ExpressResponse,
    sessionId: string,
    since: number,
    userId: string,
    projectIds: string[],
    deviceId: string,
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }
  public pull(response: ExpressResponse, sessionId: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
  public push(sessionId: string, changes: any[]): Promise<any> {
    throw new Error('Method not implemented.');
  }
  public completePush(res: ExpressResponse, sessionId: string, deviceId: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
