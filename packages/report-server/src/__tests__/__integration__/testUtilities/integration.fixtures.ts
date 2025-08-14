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
