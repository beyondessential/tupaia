/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { ParamsDictionary, Query } from 'express-serve-static-core';
import { Request } from 'express';
import { Context, EntityFields, EntityModel } from '../types';

interface FetchEntityParams extends ParamsDictionary {
  projectCode: string;
  entityCode: string;
}

interface FetchEntityQuery extends Query {
  fields?: string;
}

export type EntityResponseObject = {
  [field in keyof EntityFields]?: EntityFields[field];
};

// eslint-disable-next-line @typescript-eslint/comma-dangle
export interface FetchEntityRequest<
  P = FetchEntityParams,
  ResBody = EntityResponseObject,
  ReqBody = Record<string, never>,
  ReqQuery = FetchEntityQuery
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  context: Context<{ entity: EntityModel }>;
}
