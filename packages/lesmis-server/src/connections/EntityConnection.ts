/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import camelcaseKeys from 'camelcase-keys';
import { QueryParameters } from '@tupaia/server-boilerplate';
import { SessionHandlingApiConnection } from './SessionHandlingApiConnection';
import { LESMIS_PROJECT_NAME } from '../constants';

const { ENTITY_API_URL = 'http://localhost:8050/v1' } = process.env;

/**
 * @deprecated use @tupaia/api-client
 */
export class EntityConnection extends SessionHandlingApiConnection {
  public baseUrl = ENTITY_API_URL;

  public async getEntities(entityCode: string, queryParameters: QueryParameters = {}) {
    const response = await this.get(
      `hierarchy/${LESMIS_PROJECT_NAME}/${entityCode}/descendants`,
      queryParameters,
    );
    return camelcaseKeys(response);
  }

  public async getEntity(entityCode: string) {
    const response = await this.get(`hierarchy/${LESMIS_PROJECT_NAME}/${entityCode}`);
    return camelcaseKeys(response);
  }
}
