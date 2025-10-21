import log from 'winston';

import { CountryRecord, ProjectRecord } from '@tupaia/tsmodels';
import { getBrowserTimeZone, snakeKeys } from '@tupaia/utils';
import { DatatrakWebUserRequest } from '@tupaia/types';
import { FACT_CURRENT_USER_ID } from '@tupaia/constants';

import { DatatrakWebModelRegistry } from '../types';
import { post } from '../api';
import { hashPassword, verifyPassword } from './hash';

type SignInParams = {
  email: string;
  password: string;
};

export class AuthService {
  models: DatatrakWebModelRegistry;

  constructor(models: DatatrakWebModelRegistry) {
    this.models = models;
  }

  async saveLocalUser(userData: DatatrakWebUserRequest.ResBody, password: string): Promise<void> {
    let user = await this.models.user.findOne({ email: userData.email });
    if (!user) {
      await this.models.user.create(snakeKeys(userData));
    }

    // Only update password hash, keep other user data updated via sync
    await this.models.user.update(
      { email: userData.email },
      { password_hash: await hashPassword(password) },
    );
  }

  async signIn(params: SignInParams) {
    const isOnline = window.navigator.onLine;
    if (!isOnline) {
      const user = await this.localSignIn(params);
      return user;
    }

    try {
      return await this.remoteSignIn(params);
    } catch (error) {
      // Check if error indicates server issues or timeout
      if (this.shouldFallbackToLocal(error)) {
        log.warn('Remote sign-in failed, falling back to local authentication', error);
        return await this.localSignIn(params);
      }
      // Re-throw other errors (e.g., invalid credentials)
      throw error;
    }
  }

  async localSignIn({ email, password }: SignInParams): Promise<DatatrakWebUserRequest.ResBody> {
    const userRecord = await this.models.user.findOne({
      email,
    });

    if (!userRecord) {
      throw new Error('Invalid username or password');
    }

    if (!userRecord.password_hash) {
      throw new Error(
        'Before using DataTrak offline, please log in once while connected to the internet',
      );
    }

    if (!(await verifyPassword(userRecord.password_hash, password))) {
      throw new Error('Invalid user credentials');
    }

    const { preferences = {} } = userRecord;
    const { project_id: projectId, country_id: countryId } = preferences;

    const [project, country] = await Promise.all([
      projectId ? this.models.project.findById(projectId) : null,
      countryId ? this.models.country.findById(countryId) : null,
    ]);

    const transformedUser = await this.models.user.transformUserData(userRecord, project, country);
    await this.models.localSystemFact.set(FACT_CURRENT_USER_ID, transformedUser.id);

    return transformedUser;
  }

  async remoteSignIn(params: SignInParams): Promise<DatatrakWebUserRequest.ResBody> {
    const { user } = await post('login', {
      data: {
        emailAddress: params.email,
        password: params.password,
        deviceName: window.navigator.userAgent,
        timezone: getBrowserTimeZone(),
      },
    });

    await this.models.localSystemFact.set(FACT_CURRENT_USER_ID, user.id);

    // kick off a local save
    await this.saveLocalUser(user, params.password);

    return user;
  }

  private shouldFallbackToLocal(error: any): boolean {
    // Network or timeout errors
    if (error.name === 'NetworkError' || error.name === 'TimeoutError') {
      return true;
    }

    // HTTP status codes indicating server issues
    if (typeof error.response?.status === 'number') {
      const status = error.response.status;
      // 5xx server errors or 408 timeout
      if (status >= 500 || status === 408 || status === 503) {
        return true;
      }
    }

    return false;
  }
}
