/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { ParamsDictionary, Query } from 'express-serve-static-core';
import { LesmisSessionModel, LesmisSessionType } from './models';

export type AccessPolicyObject = Record<string, string[]>;

export interface SessionCookie {
  id: string;
  email: string;
  reset?: () => void;
}

type LesmisRequestBody = Record<string, unknown>;

export interface LesmisRequest<>extends Request<
    ParamsDictionary,
    unknown,
    LesmisRequestBody,
    Query
  > {
  sessionModel: LesmisSessionModel;
  sessionCookie?: SessionCookie;
  session?: LesmisSessionType;
}

export interface LesmisResponseBody {
  accessPolicy?: AccessPolicyObject;
  error?: string;
}

export interface Credentials {
  emailAddress: string;
  password: string;
  deviceName: string;
}

export type QueryParameters = Record<string, string>;

export type RequestBody = Record<string, unknown> | Record<string, unknown>[];

interface FetchHeaders {
  Authorization: string;
  'Content-Type'?: string;
}

export interface FetchConfig {
  method: string;
  headers: FetchHeaders;
  body?: string;
}

interface AuthResponseUser {
  email: string;
  accessPolicy: AccessPolicyObject;
}

export interface AuthResponse {
  accessToken?: string;
  refreshToken?: string;
  user?: AuthResponseUser;
}

export interface SessionDetails {
  email: string;
  accessPolicy: AccessPolicyObject;
  accessToken: string;
  refreshToken: string;
}

export interface SessionFields {
  id: string;
  email: string;
  access_policy: AccessPolicyObject;
  access_token: string;
  access_token_expiry: number;
  refresh_token: string;
}
