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
  AncestorsRequest,
  EntityAncestorsRoute,
  MultiEntityAncestorsRequest,
  MultiEntityAncestorsRoute,
} from '../routes';
import {
  attachCommonEntityContext,
  attachSingleEntityContext,
  attachMultiEntityContext,
  attachEntityFilterContext,
} from '../routes/hierarchy/middleware';
import { attachRelationshipsContext } from '../routes/hierarchy/relationships/middleware';
import { HierarchyRequest, HierarchyRoute } from '../routes/hierarchies';
import { attachHierarchyContext } from '../routes/hierarchies/middleware';

/**
 * Set up express server with middleware,
 */
export function createApp(db = new TupaiaDatabase()) {
  const builder = new MicroServiceApiBuilder(db, 'entity')
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
    .post<MultiEntityAncestorsRequest>(
      'hierarchy/:hierarchyName/ancestors',
      attachCommonEntityContext,
      attachMultiEntityContext,
      handleWith(MultiEntityAncestorsRoute),
    )
    .get<EntitySearchRequest>(
      'hierarchy/:hierarchyName/entitySearch/:searchString',
      attachCommonEntityContext,
      attachEntityFilterContext,
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
    .get<AncestorsRequest>(
      'hierarchy/:hierarchyName/:entityCode/ancestors',
      attachCommonEntityContext,
      attachSingleEntityContext,
      handleWith(EntityAncestorsRoute),
    );

  const app = builder.build();

  return app;
}
