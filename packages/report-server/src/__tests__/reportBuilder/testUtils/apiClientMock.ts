import { TupaiaApiClient } from '@tupaia/api-client';

export const apiClientMock = (entityApi: TupaiaApiClient['entity']) => {
  return {
    entity: entityApi,
  } as TupaiaApiClient;
};
