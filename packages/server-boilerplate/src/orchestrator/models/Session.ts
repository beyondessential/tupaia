import { DatabaseModel, DatabaseRecord } from '@tupaia/database';
import { AccessPolicy } from '@tupaia/access-policy';
import { RespondingError, createBearerHeader, getTokenExpiry } from '@tupaia/utils';
import { SyncDirections } from '@tupaia/constants';

import { AccessPolicyObject } from '../../types';
import { AuthConnection } from '../auth';
import { Request } from 'express';

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

export class SessionRecord extends DatabaseRecord {
  public static databaseRecord = 'session';
  public readonly id: string;
  public email: string;
  public refresh_token: string;

  private readonly authConnection: AuthConnection;

  private access_policy: AccessPolicyObject;
  private access_token: string;
  private access_token_expiry: number;

  private refreshAccessTokenPromise: Promise<void> | null;

  public constructor(model: SessionModel, fieldValues: SessionFields) {
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

  public get accessPolicy() {
    return new AccessPolicy(this.access_policy);
  }

  private isAccessTokenExpired() {
    return this.access_token_expiry <= Date.now();
  }

  public async getAuthHeader(req: Request) {
    if (this.isAccessTokenExpired()) {
      try {
        await this.refreshAccessToken();
      } catch (error) {
        if (error instanceof RespondingError && error.statusCode === 401) {
          // Refresh token is no longer valid
          await this.delete(); // Delete this session from the database
          const { res } = req;
          if (res) {
            res.clearCookie('sessionCookie'); // Delete the cookie from the user's browser
          }

          error.extraFields.redirectClient = '/login'; // Redirect client browser to the login page
        }

        throw error;
      }
    }
    return createBearerHeader(this.access_token);
  }

  public async refreshAccessToken(): Promise<void> {
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

  private async updateSessionDetails({ accessToken, accessPolicy }: SessionDetails) {
    this.access_token = accessToken;
    this.access_token_expiry = getTokenExpiry(accessToken);
    this.access_policy = accessPolicy;
    return this.save();
  }
}

export class SessionModel extends DatabaseModel {
  public static syncDirection = SyncDirections.DO_NOT_SYNC;

  public get DatabaseRecordClass() {
    return SessionRecord;
  }

  public async createSession(sessionDetails: SessionDetails) {
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
