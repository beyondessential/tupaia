/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import camelcaseKeys from 'camelcase-keys';
import { ApiConnection } from '@tupaia/server-boilerplate';
import { LESMIS_PROJECT_NAME, LESMIS_COUNTRY_ENTITY_CODE } from '../constants';

const { ENTITY_SERVER_API_URL = 'http://localhost:8050/v1' } = process.env;

export class EntityConnection extends ApiConnection {
  baseUrl = ENTITY_SERVER_API_URL;

  async getEntities() {
    const response = await this.get(
      `hierarchy/${LESMIS_PROJECT_NAME}/${LESMIS_PROJECT_NAME}/descendants`,
    );
    return camelcaseKeys(response);
  }

  async getEntity(entityCode: string[]) {
    const response = await this.get(`hierarchy/${LESMIS_PROJECT_NAME}/${entityCode}`);
    return camelcaseKeys(response);
  }
}
