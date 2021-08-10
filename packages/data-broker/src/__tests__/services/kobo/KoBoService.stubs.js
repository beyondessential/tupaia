/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { MOCK_DB_DATA, MOCK_KOBO_RESULT } from './KoBoService.fixtures';

const mockFind = (array, criteria) =>
  array.filter(currentObject => {
    for (const [key, value] of Object.entries(criteria)) {
      if (currentObject[key] !== value) {
        return false;
      }
    }
    return true;
  });

const mockFindOne = (array, criteria) => mockFind(array, criteria)[0] || undefined;

export const createModelsStub = () => ({
  dataServiceEntity: {
    find: criteria => mockFind(MOCK_DB_DATA.dataServiceEntity, criteria),
    findOne: criteria => mockFindOne(MOCK_DB_DATA.dataServiceEntity, criteria),
  },
  entity: {
    find: criteria => mockFind(MOCK_DB_DATA.entity, criteria),
    findOne: criteria => mockFindOne(MOCK_DB_DATA.entity, criteria),
  },
  dataSource: {
    getTypes: () => ({
      DATA_ELEMENT: 'dataElement',
      DATA_GROUP: 'dataGroup',
      SYNC_GROUP: 'syncGroup',
    }),
  },
});

export const createKoBoApiStub = () => ({
  fetchKoBoSubmissions: () => [MOCK_KOBO_RESULT],
});
