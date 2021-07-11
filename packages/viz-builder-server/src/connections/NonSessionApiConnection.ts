/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { ApiConnection } from '@tupaia/server-boilerplate';

export abstract class NonSessionApiConnection extends ApiConnection {
  constructor(authHeader?: string) {
    if (!authHeader) {
      throw new Error('Authorization Header is empty');
    }
    const authHandler = { getAuthHeader: async () => authHeader };
    super(authHandler);
  }
}
