/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import camelcaseKeys from 'camelcase-keys';
import { SessionHandlingApiConnection } from './SessionHandlingApiConnection';
import { isLesmisAdmin } from '../utils';

const { MEDITRAK_API_URL = 'http://localhost:8090/v2' } = process.env;

type RequestBody = Record<string, unknown> | Record<string, unknown>[];

/**
 * @deprecated use @tupaia/api-client
 */
export class MeditrakConnection extends SessionHandlingApiConnection {
  baseUrl = MEDITRAK_API_URL;

  async getUser() {
    // if user is not logged in, return null rather than fetching the api client user details
    if (!this.hasSession) {
      return {};
    }
    const user = await this.get('me');
    return { ...camelcaseKeys(user), isLesmisAdmin: isLesmisAdmin(user.accessPolicy) };
  }

  registerUser(userData: RequestBody) {
    return this.post('user', {}, userData);
  }

  async verifyEmail(token: string) {
    return this.post('auth/verifyEmail', {}, { token });
  }
}
