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
export function createApp(db = new TupaiaDatabase()) {
  return (
    new MicroServiceApiBuilder(db, 'entity')
      .useBasicBearerAuth()

      // MultiEntity routes
      .post<MultiEntityRequest>(
        'hierarchy/:hierarchyName$',
        attachCommonContext,
        attachMultiEntityContext,
        handleWith(MultiEntityRoute),
      )
      .post<MultiEntityDescendantsRequest>(
        'hierarchy/:hierarchyName/descendants',
        attachCommonContext,
        attachMultiEntityContext,
        handleWith(MultiEntityDescendantsRoute),
      )
      .post<MultiEntityRelativesRequest>(
        'hierarchy/:hierarchyName/relatives',
        attachCommonContext,
        attachMultiEntityContext,
        handleWith(MultiEntityRelativesRoute),
      )
      .post<MultiEntityRelationshipsRequest>(
        'hierarchy/:hierarchyName/relationships',
        attachCommonContext,
        attachMultiEntityContext,
        attachRelationshipsContext,
        handleWith(MultiEntityRelationshipsRoute),
      )

      // SingleEntity routes
      .get<SingleEntityRequest>(
        'hierarchy/:hierarchyName/:entityCode',
        attachCommonContext,
        attachSingleEntityContext,
        handleWith(SingleEntityRoute),
      )
      .get<DescendantsRequest>(
        'hierarchy/:hierarchyName/:entityCode/descendants',
        attachCommonContext,
        attachSingleEntityContext,
        handleWith(EntityDescendantsRoute),
      )
      .get<RelativesRequest>(
        'hierarchy/:hierarchyName/:entityCode/relatives',
        attachCommonContext,
        attachSingleEntityContext,
        handleWith(EntityRelativesRoute),
      )
      .get<RelationshipsRequest>(
        'hierarchy/:hierarchyName/:entityCode/relationships',
        attachCommonContext,
        attachSingleEntityContext,
        attachRelationshipsContext,
        handleWith(EntityRelationshipsRoute),
      )
      .build()
  );
}
