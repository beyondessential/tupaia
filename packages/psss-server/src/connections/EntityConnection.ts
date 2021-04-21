/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { PSSS_HIERARCHY } from '../constants';
import { ApiConnection } from './ApiConnection';

const { ENTITY_API_URL = 'http://localhost:8050/v1' } = process.env;

interface Entity {
  id: string;
  code: string;
  name: string;
  type: string;
}

interface EntityOptions {
  field?: keyof Entity;
  fields?: (keyof Entity)[];
  filter?: Partial<Record<keyof Entity, string | string[]>>;
  includeRootEntity?: boolean;
}

interface RelationOptions {
  ancestor?: {
    filter?: { type: string };
    field?: keyof Entity;
  };
  descendant: {
    filter: { type: string };
    field?: keyof Entity;
  };
  groupBy?: 'ancestor' | 'descendant';
}

type ResponseEntity<T extends EntityOptions> = T['field'] extends string
  ? string
  : T['fields'] extends Array<unknown>
  ? Pick<Entity, T['fields'][number]>
  : Entity;

const getFieldsParam = (fields?: (keyof Entity)[]) => fields && fields.join(',');

const getFilterParam = (filter?: EntityOptions['filter']) =>
  filter &&
  Object.entries(filter)
    .map(([key, value]) => `${key}:${value}`)
    .join(';');

const getEntityParams = (options: EntityOptions) => {
  const { fields, filter, includeRootEntity, ...restOfOptions } = options;

  return {
    ...restOfOptions,
    fields: getFieldsParam(fields),
    filter: getFilterParam(filter),
    includeRootEntity: includeRootEntity ? 'true' : undefined,
  };
};

const getRelationParams = (options: RelationOptions) => {
  const { ancestor = {}, descendant, ...restOfOptions } = options;

  return {
    ...restOfOptions,
    ancestor_filter: getFilterParam(ancestor.filter),
    ancestor_field: ancestor.field,
    descendant_filter: getFilterParam(descendant.filter),
    descendant_field: descendant.field,
  };
};

export class EntityConnection extends ApiConnection {
  baseUrl = ENTITY_API_URL;

  fetchDescendants = async <T extends EntityOptions>(
    entityCode: string,
    options: T,
  ): Promise<ResponseEntity<T>[]> => {
    const params = getEntityParams(options);
    return this.get(`hierarchy/${PSSS_HIERARCHY}/${entityCode}/descendants`, params);
  };

  fetchRelations = async (
    entityCode: string,
    options: RelationOptions,
  ): Promise<Record<string, string> | Record<string, string[]>> => {
    const params = getRelationParams(options);
    return this.get(`hierarchy/${PSSS_HIERARCHY}/${entityCode}/relations`, params);
  };
}
