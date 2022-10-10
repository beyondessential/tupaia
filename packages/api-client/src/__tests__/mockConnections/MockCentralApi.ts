/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { CentralApiInterface } from '../../connections';
import { RequestBody } from '../../connections/ApiConnection';
import { SurveyResponse } from '../../connections/CentralApi';

export class MockCentralApi implements CentralApiInterface {
  public getUser(): Promise<any> {
    throw new Error('Method not implemented.');
  }
  public registerUserAccount(
    userFields: Record<string, unknown>,
  ): Promise<{ userId: string; message: string }> {
    throw new Error('Method not implemented.');
  }
  public changeUserPassword(
    passwordChangeFields: Record<string, unknown>,
  ): Promise<{ message: string }> {
    throw new Error('Method not implemented.');
  }
  public createSurveyResponses(responses: SurveyResponse[]): Promise<void> {
    throw new Error('Method not implemented.');
  }
  public fetchResources(
    endpoint: string,
    params?: Record<string, unknown> | undefined,
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }
  public createResource(
    endpoint: string,
    params: Record<string, unknown>,
    body: RequestBody,
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }
  public updateResource(
    endpoint: string,
    params: Record<string, unknown>,
    body: RequestBody,
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }
  public deleteResource(endpoint: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
  public upsertResource(
    endpoint: string,
    params: Record<string, unknown>,
    body: RequestBody,
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
