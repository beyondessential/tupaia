/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

const MOCK_DATA_SERVICE_ENTITY = [
  {
    id: 'AAAAAAAAAAAAAAAAAAAAAAAA',
    entity_code: 'TupaiaEntityA',
    'config->>kobo_id': 'KoBoA',
  },
  {
    id: 'BBBBBBBBBBBBBBBBBBBBBBBB',
    entity_code: 'TupaiaEntityB',
    'config->>kobo_id': 'KoBoB',
  },
  {
    id: 'CCCCCCCCCCCCCCCCCCCCCCCC',
    entity_code: 'TupaiaEntityC',
    'config->>kobo_id': 'KoBoC',
  },
];

const MOCK_ENTITY = [
  {
    id: 'aaaaaaaaaaaaaaaaaaaaaaaa',
    code: 'TupaiaEntityA',
    name: 'Tupaia Entity A',
  },
  {
    id: 'bbbbbbbbbbbbbbbbbbbbbbbb',
    code: 'TupaiaEntityB',
    name: 'Tupaia Entity B',
  },
];

export const MOCK_DB_DATA = {
  dataServiceEntity: MOCK_DATA_SERVICE_ENTITY,
  entity: MOCK_ENTITY,
};
