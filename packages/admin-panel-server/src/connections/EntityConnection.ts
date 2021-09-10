/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { ApiConnection, QueryParameters } from '@tupaia/server-boilerplate';

const { ENTITY_API_URL = 'http://localhost:8050/v1' } = process.env;

/**
 * @deprecated use @tupaia/api-client
 */
export class EntityConnection extends ApiConnection {
  baseUrl = ENTITY_API_URL;

  async getEntities(
    hierarchyName: string,
    entityCode: string,
    queryParameters: QueryParameters = {},
  ) {
    return this.get(`hierarchy/${hierarchyName}/${entityCode}/descendants`, queryParameters);
  }
}
