export const DATA_SOURCE_TYPES = {
  DATA_ELEMENT: 'dataElement',
  DATA_GROUP: 'dataGroup',
};

export const RESPONSE_BY_SOURCE_TYPE = {
  dataElement: {
    results: [
      {
        analytics: [
          { dataElement: 'POP01', period: '20200214', value: 1 },
          { dataElement: 'POP01', period: '20200214', value: 2 },
        ],
        numAggregationsProcessed: 0,
      },
    ],
    metadata: {},
  },
  dataGroup: [{ event: 'testEvent', dataValues: [] }],
};
export const AGGREGATED_ANALYTICS = [
  { dataElement: 'POP01', period: '20200214', value: 3 },
  { dataElement: 'POP01', period: '20200214', value: 6 },
];
export const FILTERED_ANALYTICS = [{ dataElement: 'POP01', period: '20200214', value: 3 }];

export const DATA_ELEMENTS = {
  POP01: { code: 'POP01', name: 'Population 1' },
  POP02: { code: 'POP02', name: 'Population 2' },
  DIFF: { code: 'Diff', name: 'Other' },
};

export const DATA_GROUPS = {
  POP: {
    code: 'POP',
    name: 'Population Survey',
    dataElements: [DATA_ELEMENTS.POP01, DATA_ELEMENTS.POP02],
  },
};
