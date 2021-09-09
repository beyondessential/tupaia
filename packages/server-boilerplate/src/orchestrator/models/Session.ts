/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { DatabaseModel, DatabaseType } from '@tupaia/database';
import { AccessPolicy } from '@tupaia/access-policy';
import { getTokenExpiry } from '@tupaia/utils';
import { AccessPolicyObject } from '../../types';
import { AuthConnection } from '../auth';

interface SessionDetails {
  email: string;
  accessPolicy: AccessPolicyObject;
  accessToken: string;
  refreshToken: string;
}

interface SessionFields {
  id: string;
  email: string;
  access_policy: AccessPolicyObject;
  access_token: string;
  access_token_expiry: number;
  refresh_token: string;
}

export class SessionType extends DatabaseType {
  id: string;

  email: string;

  access_policy: AccessPolicyObject;

  access_token: string;

  access_token_expiry: number;

  refresh_token: string;

  authConnection: AuthConnection;

  refreshAccessTokenPromise: Promise<void> | null;

  static databaseType = 'session';

  constructor(model: SessionModel, fieldValues: SessionFields) {
    super(model, fieldValues);

    // explicitly reassign all field values to satisfy typescript
    this.id = fieldValues.id;
    this.email = fieldValues.email;
    this.access_policy = fieldValues.access_policy;
    this.access_token = fieldValues.access_token;
    this.access_token_expiry = fieldValues.access_token_expiry;
    this.refresh_token = fieldValues.refresh_token;

    // set up auth connection for refreshing access token
    this.authConnection = new AuthConnection();
    this.refreshAccessTokenPromise = null;
  }

  get accessPolicy() {
    return new AccessPolicy(this.access_policy);
  }

  isAccessTokenExpired() {
    return this.access_token_expiry <= Date.now();
  }

  async getAuthHeader() {
    if (this.isAccessTokenExpired()) {
      await this.refreshAccessToken();
    }
    return `Bearer ${this.access_token}`;
  }

  async refreshAccessToken(): Promise<void> {
    // Set up a single promise to avoid setting off multiple parallel refresh requests
    if (!this.refreshAccessTokenPromise) {
      const refreshAndUpdate = async () => {
        const sessionDetails = await this.authConnection.refreshAccessToken(this.refresh_token);
        await this.updateSessionDetails(sessionDetails);
        this.refreshAccessTokenPromise = null;
      };
      this.refreshAccessTokenPromise = refreshAndUpdate();
    }
    return this.refreshAccessTokenPromise;
  }

  async updateSessionDetails({ accessToken, accessPolicy }: SessionDetails) {
    this.access_token = accessToken;
    this.access_token_expiry = getTokenExpiry(accessToken);
    this.access_policy = accessPolicy;
    return this.save();
  }
}

export class SessionModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return SessionType;
  }

  async createSession(sessionDetails: SessionDetails) {
    const { email, accessPolicy, accessToken, refreshToken } = sessionDetails;
    const accessTokenExpiry = getTokenExpiry(accessToken);

    return this.create({
      email,
      access_policy: accessPolicy,
      access_token: accessToken,
      access_token_expiry: accessTokenExpiry,
      refresh_token: refreshToken,
    });
  }
}
