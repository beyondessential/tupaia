/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import camelcaseKeys from 'camelcase-keys';
import { getEnvVarOrDefault } from '@tupaia/utils';
import { hasAdminPanelAccess } from '../utils';
import { SessionHandlingApiConnection } from './SessionHandlingApiConnection';

type RequestBody = Record<string, unknown> | Record<string, unknown>[];

/**
 * @deprecated use @tupaia/api-client
 */
export class CentralConnection extends SessionHandlingApiConnection {
  public baseUrl = getEnvVarOrDefault('CENTRAL_API_URL', 'http://localhost:8090/v2');

  public async getUser() {
    // if user is not logged in, return null rather than fetching the api client user details
    if (!this.hasSession) {
      return {};
    }
    const user = await this.get('me');
    return { ...camelcaseKeys(user), hasAdminPanelAccess: hasAdminPanelAccess(user.accessPolicy) };
  }

  public registerUser(userData: RequestBody) {
    return this.post('user', {}, userData);
  }

  public updateSurveyResponse(id: string, changes: RequestBody) {
    return this.put(`surveyResponses/${id}`, {}, changes);
  }

  public async verifyEmail(token: string) {
    return this.post('auth/verifyEmail', {}, { token });
  }
}
