/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

export interface Params {
  entityCode: string;
  projectCode: string;
  dashboardCode: string;
}
export type SubscribeResponse = {
  entityCode: string;
  email: string;
  projectCode: boolean;
  dashboardCode: string;
};

export type SubscribeRequest = {
  email: string;
};

export type ResBody = SubscribeResponse;
export type ReqBody = SubscribeRequest;
export type ReqQuery = Record<string, never>;
