/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

const createDataSource = fields => ({ service_type: 'dhis', config: {}, ...fields });

export const DATA_SOURCES = {
  DS_1: createDataSource({ code: 'DE_1', dataElementCode: 'DE_CODE_1' }),
  DS_2: createDataSource({
    code: 'DE_2',
    dataElementCode: 'DE_CODE_2',
    options: { x: 'X-ray', y: 'Y-ray' },
  }),
};

export const DATA_GROUPS = {
  DG_1: {
    code: 'DG_1',
    service_type: 'dhis',
    config: {},
  },
  DG_2: {
    code: 'DG_2',
    service_type: 'dhis',
    config: {},
  },
};

export const DATA_ELEMENTS = {
  DE_1: { code: 'DE_1', name: 'Data Element 1' },
  DE_2: { code: 'DE_2', name: 'Data Element 2' },
  DE_3: { code: 'DE_2', name: 'Data Element 2' },
};

export const DATA_ELEMENTS_BY_GROUP = {
  DG_1: [DATA_ELEMENTS.DE_1, DATA_ELEMENTS.DE_2],
  DG_2: [DATA_ELEMENTS.DE_3],
};
