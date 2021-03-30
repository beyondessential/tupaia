/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { MicroServiceApiBuilder, handleWith } from '@tupaia/server-boilerplate';
import { TupaiaDatabase } from '@tupaia/database';
import {
  HierarchyRequest,
  SingleEntityRoute,
  DescendantsRequest,
  EntityDescendantsRoute,
  RelationsRequest,
  EntityRelationsRoute,
} from '../routes';
import { attachContext } from '../routes/hierarchy/middleware';

/**
 * Set up express server with middleware,
 */
export function createApp() {
  return new MicroServiceApiBuilder(new TupaiaDatabase())
    .useBasicBearerAuth('entity-server')
    .use<HierarchyRequest>('/v1/hierarchy/:hierarchyName/:entityCode', attachContext)
    .get<HierarchyRequest>(
      '/v1/hierarchy/:hierarchyName/:entityCode',
      handleWith(SingleEntityRoute),
    )
    .get<DescendantsRequest>(
      '/v1/hierarchy/:hierarchyName/:entityCode/descendants',
      handleWith(EntityDescendantsRoute),
    )
    .get<RelationsRequest>(
      '/v1/hierarchy/:hierarchyName/:entityCode/relations',
      handleWith(EntityRelationsRoute),
    )
    .build();
}
