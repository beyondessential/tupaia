import log from 'winston';

import { snakeKeys } from '@tupaia/utils';
import { DatatrakWebUserRequest } from '@tupaia/types';
import { camelcaseKeys } from '@tupaia/tsutils';
import { FACT_CURRENT_USER_ID } from '@tupaia/constants';

import { DatatrakWebModelRegistry } from '../types';
import { hashPassword, verifyPassword } from './hash';
import { login } from './login';

export type SignInParams = {
  email: string;
  password: string;
};

export class AuthService {
  models: DatatrakWebModelRegistry;

  constructor(models: DatatrakWebModelRegistry) {
    this.models = models;
  }

  async saveLocalUser(userData: DatatrakWebUserRequest.ResBody, password: string): Promise<void> {
    // save local password to repo for later use
    let user = await this.models.user.findOne({ email: userData.email });
    if (!user) {
      await this.models.user.create(snakeKeys(userData));
    }

    // Only update password hash, keep other user data updated via sync
    await this.models.user.update(
      { email: userData.email },
      // @ts-ignore accessPolicy is only available on the client
      { access_policy: userData.accessPolicy, password_hash: await hashPassword(password) },
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
    const { model, ...user } =
      (await this.models.user.findOne({
        email,
      })) || {};

    if (!user?.password_hash) {
      throw new Error(
        'You need to first login when connected to internet to use your account offline.',
      );
    }

    if (!(await verifyPassword(user.password_hash, password))) {
      throw new Error('Invalid user credentials');
    }

    await this.models.localSystemFact.set(FACT_CURRENT_USER_ID, user.id);

    return camelcaseKeys(user, { deep: true }) as DatatrakWebUserRequest.ResBody;
  }

  async remoteSignIn(params: SignInParams): Promise<DatatrakWebUserRequest.ResBody> {
    const { user } = await login(params);

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
    if (error.response?.status) {
      const status = error.response.status;
      // 5xx server errors or 408 timeout
      if (status >= 500 || status === 408 || status === 503) {
        return true;
      }
    }

    return false;
  }
}
