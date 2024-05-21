/* eslint-disable @typescript-eslint/no-unused-vars */
/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import type { MeditrakSurveyResponseRequest } from '@tupaia/types';
import { ProjectCountryAccessListRequest } from '@tupaia/types';
import { CentralApiInterface } from '..';
import { RequestBody } from '../ApiConnection';

type Data = Record<string, any>[];

type User = { email: string; password: string };
type MockData = Record<string, Data>;

type Params = {
  filter?: Record<string, unknown>;
  columns?: string[];
  sort?: string[];
};

const getValueMatchesFilter = (value: any, filter: any) => {
  if (!filter.hasOwnProperty('comparator')) {
    const result = Array.isArray(filter) ? filter.includes(value) : value === filter;
    return result;
  }
  const { comparator = '=', comparisonValue } = filter;
  if (comparator === 'between') {
    return value >= comparisonValue[0] && value <= comparisonValue[1];
  }
  if (comparator === 'in') {
    return comparisonValue.includes(value);
  }
  if (comparator === 'not in') {
    return !comparisonValue.includes(value);
  }
  if (comparator.includes('like')) {
    return value.includes(comparisonValue);
  }
  if (comparator === '>=') {
    return value >= comparisonValue;
  }
  if (comparator === '>') {
    return value > comparisonValue;
  }
  if (comparator === '<=') {
    return value <= comparisonValue;
  }
  if (comparator === '<') {
    return value < comparisonValue;
  }
  return value === comparisonValue;
};

export class MockCentralApi implements CentralApiInterface {
  private readonly user: User | null = null;
  private readonly mockData: MockData = {};
  public constructor({ user, mockData }: { user?: User; mockData?: MockData } = {}) {
    if (user) {
      this.user = user;
    }
    if (mockData) {
      this.mockData = mockData;
    }
  }
  public getUser(): Promise<any> {
    throw new Error('Method not implemented.');
  }
  public getCountryAccessList(): Promise<ProjectCountryAccessListRequest.ResBody> {
    throw new Error('Method not implemented.');
  }
  public async registerUserAccount(
    userFields: Record<string, unknown>,
  ): Promise<{ userId: string; message: string }> {
    const { id } = userFields;
    if (!id || typeof id !== 'string') {
      throw new Error('User must have a string id');
    }

    return { message: 'Successfully created user', userId: id };
  }

  public async changeUserPassword(
    passwordChangeFields: Record<string, unknown>,
  ): Promise<{ message: string }> {
    if (!this.user) {
      throw new Error(
        'Must provide a users to the MockCentralApi in order to call changeUserPassword',
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
  public async fetchResources(endpoint: string, params?: Params): Promise<any> {
    const resourceData = this.mockData[endpoint];
    if (!resourceData) return [];
    const filter = params?.filter;
    if (!filter) return resourceData;
    return resourceData.filter(resource =>
      Object.entries(filter).every(([field, check]) =>
        getValueMatchesFilter(resource[field], check),
      ),
    );
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
