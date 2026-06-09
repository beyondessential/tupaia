import { UseQueryOptions } from '@tanstack/react-query';

import { assertIsNotNullish, camelcaseKeys, ensure, isNullish } from '@tupaia/tsutils';
import { DatatrakWebEntitiesRequest, Entity } from '@tupaia/types';
import { get } from '../api';
import { useIsOfflineFirst } from '../offlineFirst';
import { ContextualQueryFunctionContext, useDatabaseQuery } from './useDatabaseQuery';

interface EntityByCodeQueryFunctionContext extends ContextualQueryFunctionContext {
  entityCode?: Entity['code'];
}

const entityByCodeQueryFunctions = {
  remote: async ({ entityCode }: EntityByCodeQueryFunctionContext) => {
    assertIsNotNullish(
      entityCode,
      `useEntityByCode query function called with ${entityCode} entityCode`,
    );
    return await get(`entity/${encodeURIComponent(entityCode)}`);
  },
  local: async ({ entityCode, models }: EntityByCodeQueryFunctionContext) => {
    assertIsNotNullish(
      entityCode,
      `useEntityByCode query function called with ${entityCode} entityCode`,
    );
    const entityRecord = await models.entity.findOne({ code: entityCode });
    if (isNullish(entityRecord)) return null;
    const entity = (await entityRecord.getData()) as Record<string, any>;
    const { attributes, ...rest } = entity;
    return { ...camelcaseKeys(rest), attributes };
  },
};

export const useEntityByCode = (
  entityCode?: Entity['code'],
  useQueryOptions?: UseQueryOptions<DatatrakWebEntitiesRequest.EntitiesResponseItem>,
) => {
  const isOfflineFirst = useIsOfflineFirst();

  const options = Object.assign(
    {
      enabled: Boolean(entityCode),
      localContext: { entityCode },
    },
    useQueryOptions,
  );

  return useDatabaseQuery(
    ['entity', { entityCode }],
    isOfflineFirst ? entityByCodeQueryFunctions.local : entityByCodeQueryFunctions.remote,
    options,
  );
};

interface EntityByIdQueryFunctionContext extends ContextualQueryFunctionContext {
  entityId?: Entity['id'];
}

const entityByIdQueryFunctions = {
  remote: async ({ entityId }: EntityByIdQueryFunctionContext) => {
    const response = await get('entities', {
      params: {
        filter: { id: ensure(entityId) },
      },
    });
    return response[0];
  },
  local: async ({ entityId, models }: EntityByIdQueryFunctionContext) => {
    assertIsNotNullish(entityId, `useEntityById query function called with ${entityId} entityId`);
    const entityRecord = await models.entity.findByIdOrThrow(entityId);
    const entity = (await entityRecord.getData()) as Record<string, any>;
    const { attributes, ...rest } = entity;
    return { ...camelcaseKeys(rest), attributes };
  },
};

export const useEntityById = (
  entityId?: Entity['id'],
  useQueryOptions?: UseQueryOptions<DatatrakWebEntitiesRequest.EntitiesResponseItem>,
) => {
  const isOfflineFirst = useIsOfflineFirst();

  const options = Object.assign(
    {
      enabled: Boolean(entityId),
      localContext: { entityId },
    },
    useQueryOptions,
  );

  return useDatabaseQuery(
    ['entities', { entityId }],
    isOfflineFirst ? entityByIdQueryFunctions.local : entityByIdQueryFunctions.remote,
    options,
  );
};
