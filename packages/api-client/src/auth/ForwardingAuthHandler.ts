/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { AuthHandler } from '../types';

export class ForwardingAuthHandler implements AuthHandler {
  private readonly authHeader: string;

  constructor(authHeader = '') {
    this.authHeader = authHeader;
  }

  public async getAuthHeader() {
    return this.authHeader;
  }
}
