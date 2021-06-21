/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { MicroServiceApiBuilder, handleWith } from '@tupaia/server-boilerplate';
import { TupaiaDatabase } from '@tupaia/database';
import {
  SingleEntityRequest,
  SingleEntityRoute,
  MultiEntityRequest,
  MultiEntityRoute,
  DescendantsRequest,
  EntityDescendantsRoute,
  MultiEntityDescendantsRequest,
  MultiEntityDescendantsRoute,
  RelativesRequest,
  EntityRelativesRoute,
  MultiEntityRelativesRequest,
  MultiEntityRelativesRoute,
  RelationshipsRequest,
  EntityRelationshipsRoute,
  MultiEntityRelationshipsRequest,
  MultiEntityRelationshipsRoute,
} from '../routes';
import {
  attachCommonContext,
  attachSingleEntityContext,
  attachMultiEntityContext,
} from '../routes/hierarchy/middleware';
import { attachRelationshipsContext } from '../routes/hierarchy/relationships/middleware';

/**
 * Set up express server with middleware,
 */
export function createApp() {
  return new MicroServiceApiBuilder(new TupaiaDatabase())
    .useBasicBearerAuth('entity-server')
    .use<SingleEntityRequest | MultiEntityRequest>('hierarchy/:hierarchyName', attachCommonContext)
    .use<MultiEntityRequest>('hierarchy/:hierarchyName$', attachMultiEntityContext)
    .use<MultiEntityRequest>('hierarchy/:hierarchyName/descendants', attachMultiEntityContext)
    .use<MultiEntityRequest>('hierarchy/:hierarchyName/relatives', attachMultiEntityContext)
    .use<MultiEntityRequest>('hierarchy/:hierarchyName/relationships', attachMultiEntityContext)
    .get<MultiEntityRequest>('hierarchy/:hierarchyName$', handleWith(MultiEntityRoute))
    .get<MultiEntityDescendantsRequest>(
      'hierarchy/:hierarchyName/descendants',
      handleWith(MultiEntityDescendantsRoute),
    )
    .get<MultiEntityRelativesRequest>(
      'hierarchy/:hierarchyName/relatives',
      handleWith(MultiEntityRelativesRoute),
    )
    .use<MultiEntityRelationshipsRequest>(
      'hierarchy/:hierarchyName/relationships',
      attachRelationshipsContext,
    )
    .get<MultiEntityRelationshipsRequest>(
      'hierarchy/:hierarchyName/relationships',
      handleWith(MultiEntityRelationshipsRoute),
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
    .use<RelationshipsRequest>(
      'hierarchy/:hierarchyName/:entityCode/relationships',
      attachRelationshipsContext,
    )
    .get<RelationshipsRequest>(
      'hierarchy/:hierarchyName/:entityCode/relationships',
      handleWith(EntityRelationshipsRoute),
    )
    .build();
}
