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
  EntitySearchRequest,
  EntitySearchRoute,
} from '../routes';
import {
  attachCommonEntityContext,
  attachSingleEntityContext,
  attachMultiEntityContext,
} from '../routes/hierarchy/middleware';
import { attachRelationshipsContext } from '../routes/hierarchy/relationships/middleware';
import { HierarchyRequest, HierarchyRoute } from '../routes/hierarchies';
import { attachHierarchyContext } from '../routes/hierarchies/middleware';

/**
 * Set up express server with middleware,
 */
export function createApp(db = new TupaiaDatabase()) {
  return (
    new MicroServiceApiBuilder(db, 'entity')
      .useBasicBearerAuth()

      // Hierarchy routes
      .get<HierarchyRequest>('hierarchies', attachHierarchyContext, handleWith(HierarchyRoute))

      // MultiEntity routes
      .post<MultiEntityRequest>(
        'hierarchy/:hierarchyName$',
        attachCommonEntityContext,
        attachMultiEntityContext,
        handleWith(MultiEntityRoute),
      )
      .post<MultiEntityDescendantsRequest>(
        'hierarchy/:hierarchyName/descendants',
        attachCommonEntityContext,
        attachMultiEntityContext,
        handleWith(MultiEntityDescendantsRoute),
      )
      .post<MultiEntityRelativesRequest>(
        'hierarchy/:hierarchyName/relatives',
        attachCommonEntityContext,
        attachMultiEntityContext,
        handleWith(MultiEntityRelativesRoute),
      )
      .post<MultiEntityRelationshipsRequest>(
        'hierarchy/:hierarchyName/relationships',
        attachCommonEntityContext,
        attachMultiEntityContext,
        attachRelationshipsContext,
        handleWith(MultiEntityRelationshipsRoute),
      )
      .post<EntitySearchRequest>(
        'hierarchy/:hierarchyName/entitySearch/:searchString',
        attachCommonEntityContext,
        attachMultiEntityContext,
        handleWith(EntitySearchRoute),
      )

      // SingleEntity routes
      .get<SingleEntityRequest>(
        'hierarchy/:hierarchyName/:entityCode',
        attachCommonEntityContext,
        attachSingleEntityContext,
        handleWith(SingleEntityRoute),
      )
      .get<DescendantsRequest>(
        'hierarchy/:hierarchyName/:entityCode/descendants',
        attachCommonEntityContext,
        attachSingleEntityContext,
        handleWith(EntityDescendantsRoute),
      )
      .get<RelativesRequest>(
        'hierarchy/:hierarchyName/:entityCode/relatives',
        attachCommonEntityContext,
        attachSingleEntityContext,
        handleWith(EntityRelativesRoute),
      )
      .get<RelationshipsRequest>(
        'hierarchy/:hierarchyName/:entityCode/relationships',
        attachCommonEntityContext,
        attachSingleEntityContext,
        attachRelationshipsContext,
        handleWith(EntityRelationshipsRoute),
      )
      .build()
  );
}
