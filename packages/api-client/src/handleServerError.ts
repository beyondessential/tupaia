/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { CustomError } from '@tupaia/utils';

export const handleServerError = (status: number | string, message: string) => {
  throw new CustomError(
    {
      responseText: message,
      responseStatus: status,
    },
    {},
  );
};
