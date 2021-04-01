/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { ParamsDictionary, Query } from 'express-serve-static-core';
import { SessionModel, SessionType } from './models/Session';

export type AccessPolicyObject = Record<string, string[]>;

export interface SessionCookie {
  id: string;
  email: string;
  reset?: () => void;
}

export type TupaiaRequestBody = Record<string, unknown>;

export interface TupaiaRequest
  extends Request<ParamsDictionary, unknown, TupaiaRequestBody, Query> {
  sessionModel: SessionModel;
  sessionCookie?: SessionCookie;
  session?: SessionType;
}

export interface TupaiaResponseBody {
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

export interface AuthResponseUser {
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
