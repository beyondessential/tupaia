import { Response as ExpressResponse } from 'express';
import { SyncApiInterface } from '../SyncApi';

export class MockSyncApi implements SyncApiInterface {
  public startSyncSession(): Promise<any> {
    throw new Error('Method not implemented.');
  }
  public checkSessionReady(sessionId: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
  public getSessionMetadata(sessionId: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
  public endSyncSession(sessionId: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
  public pollStatusUntil(endpoint: string, status: string): Promise<any> {
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
  public checkPullStatus(sessionId: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
  public getPullMetadata(sessionId: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
  public pull(response: ExpressResponse, sessionId: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
  public push(sessionId: string, changes: any[]): Promise<any> {
    throw new Error('Method not implemented.');
  }
  public completePush(sessionId: string, deviceId: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
  public checkPushStatus(sessionId: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
