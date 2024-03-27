/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

export const PUBLIC_PERMISSION_GROUP = {
  name: 'Public',
};

export const REPORT = {
  code: 'TEST_REPORT',
  config: {
    transform: [
      {
        transform: 'fetchData',
        parameters: {
          dataGroupCode: 'ABC',
          dataElementCodes: ['entityType'],
        },
        dataTableCode: 'events',
      },
    ],
  },
};
