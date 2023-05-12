/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ModelRegistry, ApiRequestLogModel, APIClientModel } from '@tupaia/database';
import { UserModel } from './models';

export type AccessPolicyObject = Record<string, string[]>;

export type EmptyObject = Record<string, never>;

/**
 * @deprecated use @tupaia/api-client
 */
export type QueryParameters = Record<string, string>;

export type RequestBody = Record<string, unknown> | Record<string, unknown>[];

export interface ServerBoilerplateModelRegistry extends ModelRegistry {
  readonly apiRequestLog: ApiRequestLogModel;
  readonly apiClient: APIClientModel;
  readonly user: UserModel;
}
