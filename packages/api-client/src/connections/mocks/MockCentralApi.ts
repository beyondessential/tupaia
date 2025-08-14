/* eslint-disable @typescript-eslint/no-unused-vars */
import type { MeditrakSurveyResponseRequest } from '@tupaia/types';
import { ProjectCountryAccessListRequest } from '@tupaia/types';
import { CentralApiInterface } from '..';
import { RequestBody } from '../ApiConnection';
import { SurveyResponseCreatedResponse } from '../../types';

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
  public getCountryAccessList(): Promise<ProjectCountryAccessListRequest.ResBody> {
    throw new Error('Method not implemented.');
  }
  public registerUserAccount(
    userFields: Record<string, unknown>,
  ): Promise<{ userId: string; message: string }> {
    throw new Error('Method not implemented.');
  }
  public verifyUserEmail(token: string): Promise<any> {
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

  public createSurveyResponse(
    response: MeditrakSurveyResponseRequest,
  ): Promise<SurveyResponseCreatedResponse> {
    throw new Error('Method not implemented.');
  }

  public resubmitSurveyResponse(
    originalResponseId: string,
    newResponse: MeditrakSurveyResponseRequest,
  ): Promise<void> {
    throw new Error('Method not implemented.');
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
  public fetchResourcesWithPost = this.createResource;
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
