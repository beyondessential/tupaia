/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { MicroServiceAppBuilder, handleWith } from '@tupaia/server-boilerplate';
import { EntityServerModelRegistry } from '../types';
import {
  HierarchyRequest,
  SingleEntityRoute,
  DescendantsRequest,
  EntityDescendantsRoute,
} from '../routes';
import { attachContext } from '../routes/hierarchy/middleware';

/**
 * Set up express server with middleware,
 */
export function createApp(models: EntityServerModelRegistry) {
  return new MicroServiceAppBuilder(models)
    .use<HierarchyRequest>('/v1/hierarchy/:hierarchyName/:entityCode', attachContext)
    .get<HierarchyRequest>(
      '/v1/hierarchy/:hierarchyName/:entityCode',
      handleWith(SingleEntityRoute),
    )
    .get<DescendantsRequest>(
      '/v1/hierarchy/:hierarchyName/:entityCode/descendants',
      handleWith(EntityDescendantsRoute),
    )
    .build();
}
