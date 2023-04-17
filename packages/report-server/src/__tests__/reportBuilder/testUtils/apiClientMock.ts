/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { TupaiaApiClient } from '@tupaia/api-client';

export const apiClientMock = (entityApi: TupaiaApiClient['entity']) => {
  return {
    entity: entityApi,
  } as TupaiaApiClient;
};
