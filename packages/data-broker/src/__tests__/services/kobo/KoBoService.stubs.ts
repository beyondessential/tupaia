/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { createModelsStub as baseCreateModelsStub } from '@tupaia/database';
import type { KoBoApi } from '@tupaia/kobo-api';
import { MOCK_DB_DATA, MOCK_KOBO_RESULT } from './KoBoService.fixtures';

export const createModelsStub = () => {
  return baseCreateModelsStub({
    dataServiceEntity: {
      records: MOCK_DB_DATA.dataServiceEntity,
    },
    entity: {
      records: MOCK_DB_DATA.entity,
    },
    dataSource: {
      records: [],
      getTypes: () => ({
        DATA_ELEMENT: 'dataElement',
        DATA_GROUP: 'dataGroup',
        SYNC_GROUP: 'syncGroup',
      }),
    },
  });
};

export const createKoBoApiStub = () =>
  (({ fetchKoBoSubmissions: () => [MOCK_KOBO_RESULT] } as unknown) as KoBoApi);
