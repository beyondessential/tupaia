/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { AuthHandler } from '../types';

export class TokenAuthHandler implements AuthHandler {
  private readonly authHeader: string;

  public constructor(token = '') {
    this.authHeader = `Authorization ${token}`;
  }

  public async getAuthHeader() {
    return this.authHeader;
  }
}
