/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { AuthApiInterface } from '..';
import { AccessPolicyObject } from '../../types';

type User = { id: string; email: string; password: string; accessPolicy: AccessPolicyObject };
type Session = { email: string; refreshToken: string; accessToken: string };

export class MockAuthApi implements AuthApiInterface {
  private readonly users: User[];
  private readonly sessions: Session[];

  public constructor(users: User[] = [], sessions: Session[] = []) {
    this.users = users;
    this.sessions = sessions;
  }

  public async login(authDetails: { emailAddress: string; password: string; deviceName: string }) {
    const { emailAddress, password } = authDetails;
    const user = this.users.find(
      ({ email, password: userPassword }) => emailAddress === email && password === userPassword,
    );
    if (!user) {
      throw new Error('Incorrect username or password');
    }

    let session = this.sessions.find(({ email }) => emailAddress === email);
    if (!session) {
      session = {
        email: emailAddress,
        accessToken: `${emailAddress}_accessToken`,
        refreshToken: `${emailAddress}_refreshToken`,
      };
      this.sessions.push(session);
    }

    return {
      email: emailAddress,
      accessPolicy: user.accessPolicy,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      user: { id: user.id, email: user.email, accessPolicy: user.accessPolicy },
    };
  }

  public async refreshAccessToken(refreshToken: string) {
    const session = this.sessions.find(
      ({ refreshToken: sessionRefreshToken }) => refreshToken === sessionRefreshToken,
    );
    if (!session) {
      throw new Error(`Refresh token expired, please login again`);
    }

    const user = this.users.find(({ email }) => email === session.email);
    if (!user) {
      throw new Error(`No user exists for session: ${session.email}`);
    }

    return {
      email: session.email,
      accessPolicy: user.accessPolicy,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      user: { id: user.id, email: user.email, accessPolicy: user.accessPolicy },
    };
  }
}
