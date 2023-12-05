/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

export interface Params {
  entityCode: string;
  projectCode: string;
  dashboardCode: string;
}
export type UnsubscribeResponse = {
  entityCode: string;
  email: string;
  projectCode: boolean;
  dashboardCode: string;
};

export type UnsubscribeRequest = {
  email: string;
  unsubscribeTime: Date;
};

export type ResBody = UnsubscribeResponse;
export type ReqBody = UnsubscribeRequest;
export type ReqQuery = Record<string, never>;
