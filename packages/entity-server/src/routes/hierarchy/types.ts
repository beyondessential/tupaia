/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Resolved } from '@tupaia/types';
import { EntityFields, EntityRecord, EntityFilter } from '../../models';
import { extendedFieldFunctions } from './extendedFieldFunctions';
import { Flattable, Flattened } from '../../types';

export interface SingleEntityRequestParams {
  hierarchyName: string;
  entityCode: string;
}

export interface MultiEntityRequestParams {
  hierarchyName: string;
}

export type RequestBody = Record<string, never>;

export type MultiEntityRequestBody = RequestBody & {
  entities: string[];
};

export const MultiEntityRequestBodySchema = {
  type: 'object',
  properties: {
    entities: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
  required: ['entities'],
};

export interface EntityRequestQuery {
  fields?: string;
  field?: string;
  filter?: string;
}

export type ExtendedFieldFunctions = Readonly<{
  [field in keyof typeof extendedFieldFunctions]: Resolved<
    ReturnType<(typeof extendedFieldFunctions)[field]>
  >;
}>;

export type FlattableEntityFieldName = keyof Flattable<EntityFields>;

type ExcludeCommonFields<T, U> = Omit<T, Extract<keyof T, keyof U>>;

export type ExtendedEntityFields = ExcludeCommonFields<EntityFields, ExtendedFieldFunctions> &
  ExtendedFieldFunctions;
export type ExtendedEntityFieldName = keyof ExtendedEntityFields;

export type EntityResponseObject = {
  [field in ExtendedEntityFieldName]?: ExtendedEntityFields[field];
};

export type FlattenedEntity = Flattened<EntityFields>;

export type EntityResponse = EntityResponseObject | FlattenedEntity;

export type CommonContext = {
  hierarchyId: string;
  allowedCountries: string[];
  fields: ExtendedEntityFieldName[];
  filter: EntityFilter;
  field?: FlattableEntityFieldName;
};

export interface SingleEntityContext extends CommonContext {
  entity: EntityRecord;
}

export interface MultiEntityContext extends CommonContext {
  entities: EntityRecord[];
}

export interface SingleEntityRequest<
  P = SingleEntityRequestParams,
  ResBody = EntityResponse,
  ReqBody = RequestBody,
  ReqQuery = EntityRequestQuery,
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  ctx: SingleEntityContext;
}

export interface MultiEntityRequest<
  P = MultiEntityRequestParams,
  ResBody = EntityResponse[],
  ReqBody = MultiEntityRequestBody,
  ReqQuery = EntityRequestQuery,
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  ctx: MultiEntityContext;
}
