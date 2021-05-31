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
  RelativesRequest,
  EntityRelativesRoute,
  MultiEntityRelativesRequest,
  MultiEntityRelativesRoute,
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
    .use<SingleEntityRequest | MultiEntityRequest>('hierarchy/:hierarchyName', attachCommonContext)
    .use<MultiEntityRequest>('hierarchy/:hierarchyName/descendants', attachMultiEntityContext)
    .use<MultiEntityRequest>('hierarchy/:hierarchyName/relatives', attachMultiEntityContext)
    .use<MultiEntityRequest>('hierarchy/:hierarchyName/relations', attachMultiEntityContext)
    .get<MultiEntityDescendantsRequest>(
      'hierarchy/:hierarchyName/descendants',
      handleWith(MultiEntityDescendantsRoute),
    )
    .get<MultiEntityRelativesRequest>(
      'hierarchy/:hierarchyName/relatives',
      handleWith(MultiEntityRelativesRoute),
    )
    .use<MultiEntityRelationsRequest>('hierarchy/:hierarchyName/relations', attachRelationsContext)
    .get<MultiEntityRelationsRequest>(
      'hierarchy/:hierarchyName/relations',
      handleWith(MultiEntityRelationsRoute),
    )
    .use<SingleEntityRequest>('hierarchy/:hierarchyName/:entityCode', attachSingleEntityContext)
    .get<SingleEntityRequest>('hierarchy/:hierarchyName/:entityCode', handleWith(SingleEntityRoute))
    .get<DescendantsRequest>(
      'hierarchy/:hierarchyName/:entityCode/descendants',
      handleWith(EntityDescendantsRoute),
    )
    .get<RelativesRequest>(
      'hierarchy/:hierarchyName/:entityCode/relatives',
      handleWith(EntityRelativesRoute),
    )
    .use<RelationsRequest>('hierarchy/:hierarchyName/:entityCode/relations', attachRelationsContext)
    .get<RelationsRequest>(
      'hierarchy/:hierarchyName/:entityCode/relations',
      handleWith(EntityRelationsRoute),
    )
    .build();
}
