/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import type { MeditrakSurveyResponseRequest } from '@tupaia/types';
import { CentralApiInterface } from '..';
import { RequestBody } from '../ApiConnection';

export class MockCentralApi implements CentralApiInterface {
  private readonly user: { email: string; password: string } | undefined;
  private readonly resources: Record<string, Record<string, unknown>[]>;

  public constructor(
    mockData: {
      user?: { email: string; password: string };
      resources?: Record<string, Record<string, unknown>[]>;
    } = {},
  ) {
    this.user = mockData.user;
    this.resources = mockData.resources || {};
  }

  public getUser(): Promise<any> {
    throw new Error('Method not implemented.');
  }

  public async registerUserAccount(userFields: { id: string }) {
    return { message: 'Successfully created user', userId: userFields.id };
  }

  public async changeUserPassword(
    passwordChangeFields: Record<string, unknown>,
  ): Promise<{ message: string }> {
    if (!this.user) {
      throw new Error(
        'Must provide a user to the MockCentralApi in order to call changeUserPassword',
      );
    }

    const { oldPassword, password, passwordConfirm } = passwordChangeFields;
    if (oldPassword !== this.user.password) {
      throw new Error('Incorrect old password');
    }

    if (password !== passwordConfirm) {
      throw new Error('password != confirm');
    }

    return { message: 'Successfully changed password' };
  }

  public async createSurveyResponses(responses: MeditrakSurveyResponseRequest[]) {
    // Do nothing
  }

  public async fetchResources(
    endpoint: string,
    params: { filter?: Record<string, unknown>; columns?: string[] } = {},
  ): Promise<any> {
    const resourcesOfType = this.resources[endpoint];
    if (!resourcesOfType) {
      throw new Error(`No resources of type ${endpoint} provided to MockCentralApi`);
    }

    const { filter, columns } = params;
    if (!filter && !columns) {
      return resourcesOfType;
    }

    let resourcesToReturn = [...resourcesOfType];
    if (filter) {
      resourcesToReturn = resourcesToReturn.filter(r =>
        Object.entries(r).every(
          ([field, value]) => filter[field] === undefined || filter[field] === value,
        ),
      );
    }

    if (columns) {
      resourcesToReturn = resourcesToReturn.map(r =>
        Object.fromEntries(columns.map(c => [c, r[c]])),
      );
    }

    return resourcesToReturn;
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
