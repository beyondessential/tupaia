/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { MOCK_DB_DATA } from './KoBoService.fixtures';

const mockFind = (array, criteria) => {
  return array.filter(currentObject => {
    for (const [key, value] of Object.entries(criteria)) {
      if (currentObject[key] !== value) {
        return false;
      }
    }
    return true;
  });
};

const mockFindOne = (array, criteria) => {
  return mockFind(array, criteria)[0] || undefined;
};

export const createModelsStub = () => ({
  dataServiceEntity: {
    find: criteria => mockFind(MOCK_DB_DATA.dataServiceEntity, criteria),
    findOne: criteria => mockFindOne(MOCK_DB_DATA.dataServiceEntity, criteria),
  },
  entity: {
    find: criteria => mockFind(MOCK_DB_DATA.entity, criteria),
    findOne: criteria => mockFindOne(MOCK_DB_DATA.entity, criteria),
  },
});
