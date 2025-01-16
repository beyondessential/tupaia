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
  });
};

export const createKoBoApiStub = () =>
  (({ fetchKoBoSubmissions: () => [MOCK_KOBO_RESULT] } as unknown) as KoBoApi);
