/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { MicroServiceApiBuilder, handleWith } from '@tupaia/server-boilerplate';
import { TupaiaDatabase } from '@tupaia/database';
import {
  SingleEntityRequest,
  MultiEntityRequest,
  SingleEntityRoute,
  DescendantsRequest,
  EntityDescendantsRoute,
  MultiEntityDescendantsRequest,
  MultiEntityDescendantsRoute,
  RelationsRequest,
  EntityRelationsRoute,
  MultiEntityRelationsRequest,
  MultiEntityRelationsRoute,
} from '../routes';
import {
  attachCommonContext,
  attachSingleEntityContext,
  attachMultiEntityContext,
} from '../routes/hierarchy/middleware';
import { attachRelationsContext } from '../routes/hierarchy/relations/middleware';

/**
 * Set up express server with middleware,
 */
export function createApp() {
  return new MicroServiceApiBuilder(new TupaiaDatabase())
    .useBasicBearerAuth('entity-server')
    .use<SingleEntityRequest | MultiEntityRequest>(
      '/v1/hierarchy/:hierarchyName',
      attachCommonContext,
    )
    .use<MultiEntityRequest>(
      ['/v1/hierarchy/:hierarchyName/relations', '/v1/hierarchy/:hierarchyName/descendants'],
      attachMultiEntityContext,
    )
    .get<MultiEntityDescendantsRequest>(
      '/v1/hierarchy/:hierarchyName/descendants',
      handleWith(MultiEntityDescendantsRoute),
    )
    .use<MultiEntityRelationsRequest>(
      '/v1/hierarchy/:hierarchyName/relations',
      attachRelationsContext,
    )
    .get<MultiEntityRelationsRequest>(
      '/v1/hierarchy/:hierarchyName/relations',
      handleWith(MultiEntityRelationsRoute),
    )
    .use<SingleEntityRequest>('/v1/hierarchy/:hierarchyName/:entityCode', attachSingleEntityContext)
    .get<SingleEntityRequest>(
      '/v1/hierarchy/:hierarchyName/:entityCode',
      handleWith(SingleEntityRoute),
    )
    .get<DescendantsRequest>(
      '/v1/hierarchy/:hierarchyName/:entityCode/descendants',
      handleWith(EntityDescendantsRoute),
    )
    .use<RelationsRequest>(
      '/v1/hierarchy/:hierarchyName/:entityCode/relations',
      attachRelationsContext,
    )
    .get<RelationsRequest>(
      '/v1/hierarchy/:hierarchyName/:entityCode/relations',
      handleWith(EntityRelationsRoute),
    )
    .build();
}
