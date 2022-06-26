/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import type { KoBoApi } from '@tupaia/kobo-api';
import { DataBrokerModelRegistry, DbConditions, Entity } from '../../../types';
import { MockDataServiceEntity, MOCK_DB_DATA, MOCK_KOBO_RESULT } from './KoBoService.fixtures';

const mockFind = <T extends Record<string, unknown>>(array: T[], criteria: DbConditions<T>) =>
  array.filter(currentObject => {
    for (const [key, value] of Object.entries(criteria)) {
      if (currentObject[key] !== value) {
        return false;
      }
    }
    return true;
  });

const mockFindOne = <T extends Record<string, unknown>>(array: T[], criteria: DbConditions<T>) =>
  mockFind(array, criteria)[0] || undefined;

export const createModelsStub = () =>
  (({
    dataServiceEntity: {
      find: (criteria: DbConditions<MockDataServiceEntity>) =>
        mockFind(MOCK_DB_DATA.dataServiceEntity, criteria),
      findOne: (criteria: DbConditions<MockDataServiceEntity>) =>
        mockFindOne(MOCK_DB_DATA.dataServiceEntity, criteria),
    },
    entity: {
      find: (criteria: DbConditions<Entity>) => mockFind(MOCK_DB_DATA.entity, criteria),
      findOne: (criteria: DbConditions<Entity>) => mockFindOne(MOCK_DB_DATA.entity, criteria),
    },
    dataSource: {
      getTypes: () => ({
        DATA_ELEMENT: 'dataElement',
        DATA_GROUP: 'dataGroup',
        SYNC_GROUP: 'syncGroup',
      }),
    },
  } as unknown) as DataBrokerModelRegistry);

export const createKoBoApiStub = () =>
  (({ fetchKoBoSubmissions: () => [MOCK_KOBO_RESULT] } as unknown) as KoBoApi);
