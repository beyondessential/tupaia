/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import type { MeditrakSurveyResponseRequest } from '@tupaia/types';
import { CentralApiInterface } from '..';
import { RequestBody } from '../ApiConnection';

type Data = Record<string, any>[];

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
  private readonly mockData: MockData = {};
  public constructor(mockData: MockData = {}) {
    this.mockData = mockData;
  }
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
  public createSurveyResponses(responses: MeditrakSurveyResponseRequest[]): Promise<void> {
    throw new Error('Method not implemented.');
  }
  public fetchResources(endpoint: string, params?: Params): Promise<any> {
    return Promise.resolve(
      this.mockData[endpoint]?.filter(resource => {
        if (params?.filter) {
          return Object.entries(params.filter)?.every(([field, filter]) => {
            const resourceValue = resource[field];
            return getValueMatchesFilter(resourceValue, filter);
          });
        }
        return true;
      }) ?? [],
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
