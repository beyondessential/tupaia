/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { UnauthenticatedError } from '@tupaia/utils';
import { Request } from 'express';

export const authHandlerProvider = (req: Request) => {
  return {
    getAuthHeader: () => {
      const { session } = req;

      if (!session) {
        throw new UnauthenticatedError('Session is not attached');
      }
      return session.getAuthHeader();
    },
  };
};
