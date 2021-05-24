/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import camelcaseKeys from 'camelcase-keys';
import { SessionHandlingApiConnection } from './SessionHandlingApiConnection';

const { MEDITRAK_API_URL = 'http://localhost:8090/v2' } = process.env;

export class MeditrakConnection extends SessionHandlingApiConnection {
  baseUrl = MEDITRAK_API_URL;

  async getUser() {
    // if user is not logged in, return null rather than fetching the api client user details
    if (!this.hasSession) {
      return {};
    }
    const user = await this.get('me');
    return camelcaseKeys(user);
  }

  /*
   * Function will attempt to create a new user on the TupaiaApp server
   * and check that the results of an App create user response are valid,
   * and throw an error if not
   *
   * Successful response should take the form of:
   * {
   *   "userId": "5a0ccc1ee54aa41b031c072b"
   * }
   *
   * Unsuccessful response should take the form of:
   * {
   *   "error": "Existing user found with same email address."
   * }
   * or
   * {
   *   "error": "Please complete fields."
   * }
   */
  async registerUser(query = {}, userFields) {
    const user = await this.post('user', query, userFields);
    console.log('user', user);
    return 'success';
  }
}
