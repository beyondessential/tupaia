import { Project } from '@tupaia/types';
import { EntityRecord } from '@tupaia/tsmodels';

import { DatabaseEffectOptions, ResultObject, useDatabaseEffect } from './useDatabaseEffect';
import { EntityResponseObject, ExtendedEntityFieldName } from '../../utils/formatEntity';
import {
  getEntityDescendants,
  GetEntityDescendantsParams,
} from '../../database/getEntityDescendants';

export type UseProjectEntitiesParams = {
  filter?: Record<string, unknown>;
  fields?: ExtendedEntityFieldName[];
  pageSize?: number;
};

export const useProjectEntities = (
  projectCode?: Project['code'],
  params?: GetEntityDescendantsParams,
  options?: DatabaseEffectOptions,
): ResultObject<EntityResponseObject[]> =>
  useDatabaseEffect(
    async (models, accessPolicy, user) => {
      if (!projectCode) {
        return [];
      }

      return getEntityDescendants(models, projectCode, params, user!, accessPolicy!);
    },
    [projectCode, JSON.stringify(options)],
    {
      ...options,
      enabled: !!projectCode && (options?.enabled ?? true),
      placeholderData: [] as EntityRecord[],
    },
  );
