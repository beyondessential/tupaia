/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { AuthHandler } from '../types';

export class BasicAuthHandler implements AuthHandler {
  private readonly authHeader: string;

  public constructor(username: string, password: string) {
    this.authHeader = this.buildAuthHeader(username, password);
  }

  public async getAuthHeader() {
    return this.authHeader;
  }

  private buildAuthHeader(username: string, password: string): string {
    return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
  }
}
