/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import camelcaseKeys from 'camelcase-keys';

import { ApiConnection } from './ApiConnection';

const { MEDITRAK_API_URL = 'http://localhost:8090/v2' } = process.env;

export class MeditrakConnection extends ApiConnection {
  baseUrl = MEDITRAK_API_URL;

  async getUser() {
    const user = await this.get('me');
    return camelcaseKeys(user);
  }
}
