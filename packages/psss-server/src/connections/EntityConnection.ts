/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { removeAt } from '@tupaia/utils';
import { PSSS_ENTITY, PSSS_HIERARCHY } from '../constants';
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
    .map(([key, value]) => `${key}==${value}`)
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

/**
 * @deprecated use @tupaia/api-client
 */
export class EntityConnection extends ApiConnection {
  baseUrl = ENTITY_API_URL;

  public fetchCountries = async () =>
    this.fetchDescendants(PSSS_ENTITY, {
      filter: { type: 'country' },
    });

  public fetchCountryAndSites = async (countryCode: string) => {
    const entities = await this.fetchDescendants(countryCode, {
      filter: { type: 'facility' },
      includeRootEntity: true,
    });

    const countryIndex = entities.findIndex(e => e.code === countryCode);
    if (countryIndex === -1) {
      throw new Error(`Requested country '${countryCode}' is missing in the descendant response`);
    }
    const country = entities[countryIndex];
    const sites = removeAt(entities, countryIndex);

    return { country, sites };
  };

  public fetchSiteCodes = async (entityCode: string) =>
    this.fetchDescendants(entityCode, {
      field: 'code',
      filter: { type: 'facility' },
    });

  public fetchSiteCodeToDistrictName = async (entityCode: string) =>
    this.fetchRelations(entityCode, {
      ancestor: { filter: { type: 'district' }, field: 'name' },
      descendant: { filter: { type: 'facility' }, field: 'code' },
      groupBy: 'descendant',
    });

  private fetchDescendants = async <T extends EntityOptions>(
    entityCode: string,
    options: T,
  ): Promise<ResponseEntity<T>[]> => {
    const params = getEntityParams({
      fields: ['id', 'code', 'name', 'type'],
      ...options,
    });
    return this.get(`hierarchy/${PSSS_HIERARCHY}/${entityCode}/descendants`, params);
  };

  private fetchRelations = async (
    entityCode: string,
    options: RelationOptions,
  ): Promise<Record<string, string> | Record<string, string[]>> => {
    const params = getRelationParams(options);
    return this.get(`hierarchy/${PSSS_HIERARCHY}/${entityCode}/relationships`, params);
  };
}
