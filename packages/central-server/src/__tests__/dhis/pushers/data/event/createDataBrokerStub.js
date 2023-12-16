/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createJestMockInstance } from '@tupaia/utils';
import { SERVER_NAME, DATA_SOURCE_TYPE } from './EventPusher.fixtures';

const DEFAULT_DIAGNOSTICS = {
  wasSuccessful: true,
  counts: { imported: 0, updated: 0, deleted: 0, ignored: 0 },
  errors: [],
};

export const createDataBrokerStub = () =>
  createJestMockInstance('@tupaia/data-broker', 'DataBroker', {
    push: async () => ({ diagnostics: DEFAULT_DIAGNOSTICS, serverName: SERVER_NAME }),
    delete: async () => DEFAULT_DIAGNOSTICS,
    getDataSourceTypes: () => ({ DATA_GROUP: DATA_SOURCE_TYPE }),
  });
