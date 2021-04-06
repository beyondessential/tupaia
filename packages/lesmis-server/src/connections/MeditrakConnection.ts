/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import camelcaseKeys from 'camelcase-keys';
import { SessionHandlingApiConnection } from './SessionHandlingApiConnection';

const { MEDITRAK_API_URL = 'http://localhost:8090/v2' } = process.env;

export class MeditrakConnection extends SessionHandlingApiConnection {
  baseUrl = MEDITRAK_API_URL;

  getDefaultCredentials() {
    const {
      MICROSERVICE_CLIENT_USERNAME: username,
      MICROSERVICE_CLIENT_PASSWORD: password,
    } = process.env;
    if (!username || !password) {
      throw new Error(
        'Default credentials for MeditrakConnection must be defined as environment variables',
      );
    }
    return { username, password };
  }

  async getUser() {
    const user = await this.get('me', {});
    return camelcaseKeys(user);
  }
}
