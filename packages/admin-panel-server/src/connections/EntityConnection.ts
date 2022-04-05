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
  public baseUrl = ENTITY_API_URL;

  public async getEntities(
    hierarchyName: string,
    entityCode: string,
    queryParameters: QueryParameters = {},
  ) {
    const projectEntity = await this.post(`hierarchy/${hierarchyName}`, queryParameters, {
      entities: [entityCode],
    });
    const descendants = await this.get(
      `hierarchy/${hierarchyName}/${entityCode}/descendants`,
      queryParameters,
    );
    return projectEntity.concat(descendants);
  }
}
