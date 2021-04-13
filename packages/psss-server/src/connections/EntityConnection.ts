/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { PSSS_ENTITY, PSSS_HIERARCHY } from '../constants';
import { ApiConnection } from './ApiConnection';

const { ENTITY_API_URL = 'http://localhost:8050/v1' } = process.env;

type EntityObject = {
  id: string;
  code: string;
  name: string;
};

interface EntityFilter {
  type?: string | string[];
}

const buildFilter = (fields: EntityFilter) =>
  Object.entries(fields)
    .map(([key, value]) => `${key}:${value}`)
    .join(';');

export class EntityConnection extends ApiConnection {
  baseUrl = ENTITY_API_URL;

  fetchCountries = async (): Promise<EntityObject[]> => {
    const filter = buildFilter({ type: 'country' });
    return this.get(`hierarchy/${PSSS_HIERARCHY}/${PSSS_ENTITY}/descendants`, {
      filter,
    });
  };
}
