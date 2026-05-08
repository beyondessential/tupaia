import { UseQueryOptions } from '@tanstack/react-query';

import { assertIsNotNullish, camelcaseKeys, ensure, isNullish } from '@tupaia/tsutils';
import { DatatrakWebEntitiesRequest, Entity, Project } from '@tupaia/types';
import { get } from '../api';
import { useCurrentUserContext } from '../CurrentUserContext';
import { useIsOfflineFirst } from '../offlineFirst';
import { ContextualQueryFunctionContext, useDatabaseQuery } from './useDatabaseQuery';

interface EntityByCodeQueryFunctionContext extends ContextualQueryFunctionContext {
  entityCode?: Entity['code'];
  projectId?: Project['id'];
}

const entityByCodeQueryFunctions = {
  remote: async ({ entityCode }: EntityByCodeQueryFunctionContext) => {
    assertIsNotNullish(
      entityCode,
      `useEntityByCode query function called with ${entityCode} entityCode`,
    );
    return await get(`entity/${encodeURIComponent(entityCode)}`);
  },
  local: async ({ entityCode, projectId, models }: EntityByCodeQueryFunctionContext) => {
    assertIsNotNullish(
      entityCode,
      `useEntityByCode query function called with ${entityCode} entityCode`,
    );
    // TUP-3060: scope to the current project so post-RN-1853 sub-country
    // duplicates resolve to the user's project's copy. projectId may be null
    // for structural lookups (world / project / country) — findOneByCodeInProject
    // falls back to bare findOne in that case.
    const entityRecord = await models.entity.findOneByCodeInProject(
      entityCode,
      projectId ?? null,
    );
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
  const { projectId } = useCurrentUserContext();

  const options = Object.assign(
    {
      enabled: Boolean(entityCode),
      localContext: { entityCode, projectId },
    },
    useQueryOptions,
  );

  return useDatabaseQuery(
    ['entity', { entityCode, projectId }],
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
