// import { KeysToCamelCase, Project } from '@tupaia/types';
// import { EntityRecord } from '@tupaia/tsmodels';

// import { DatabaseEffectOptions, ResultObject, useDatabaseEffect } from './useDatabaseEffect';
// import { EntityResponseObject, ExtendedEntityFieldName } from '../../utils/formatEntity';
// import {
//   getEntityDescendants,
//   GetEntityDescendantsParams,
// } from '../../database';

// export type UseProjectEntitiesParams = {
//   filter?: Record<string, unknown>;
//   fields?: ExtendedEntityFieldName[];
//   pageSize?: number;
// };

// export interface EntityResponse
//   extends KeysToCamelCase<
//     EntityResponseObject & {
//       isRecent?: boolean;
//     }
//   > {}

// export const useProjectEntities = (
//   projectCode?: Project['code'],
//   params?: GetEntityDescendantsParams,
//   options?: DatabaseEffectOptions,
// ): ResultObject<EntityResponse[]> => [];
// // useDatabaseEffect(
// //   async (models, accessPolicy, user) => {
// //     if (!projectCode) {
// //       return [];
// //     }

// //     return getEntityDescendants(models, projectCode, params, user!, accessPolicy!);
// //   },
// //   [projectCode, JSON.stringify(params), options?.enabled],
// //   {
// //     ...options,
// //     enabled: !!projectCode && (options?.enabled ?? true),
// //     placeholderData: [] as EntityRecord[],
// //   },
// // );
