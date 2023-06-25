/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { MapOverlay, MapOverlayGroup, MapOverlayGroupRelation } from '@tupaia/types';
import groupBy from 'lodash.groupby';
import keyBy from 'lodash.keyby';

// TODO: WAITP-1278 split request types to types package
// (And actually define it)
export type MapOverlaysRequest = Request<any, any, any, any>;

interface NestedMapOverlayGroup extends MapOverlayGroup {
  children?: OverlayChild[];
}
type OverlayChild = NestedMapOverlayGroup | MapOverlay;

export class MapOverlaysRoute extends Route<MapOverlaysRequest> {
  public async buildResponse() {
    const { params, ctx } = this.req;
    const { projectCode, entityCode } = params;

    const project = (
      await ctx.services.central.fetchResources('projects', {
        filter: { code: projectCode },
        columns: ['entity_hierarchy.name'],
      })
    )[0];
    const entityHierarchyName = project['entity_hierarchy.name'];

    const entity = await ctx.services.entity.getEntity(entityHierarchyName, entityCode);
    const mapOverlays = await ctx.services.central.fetchResources('mapOverlays', {
      filter: {
        country_codes: {
          comparator: '@>',
          // Project entities do not have a country_code
          comparisonValue: [entity.country_code || entity.code],
        },
        project_codes: {
          comparator: '@>',
          comparisonValue: [projectCode],
        },
      },
    });

    // Map overlay groups can be nested so we need to keep
    // searching until we find the root groups
    let mapOverlayRelations = await ctx.services.central.fetchResources(
      'mapOverlayGroupRelations',
      {
        filter: {
          child_type: 'mapOverlay',
          child_id: mapOverlays.map((overlay: MapOverlay) => overlay.id),
        },
      },
    );
    let parentMapOverlayRelations = await ctx.services.central.fetchResources(
      'mapOverlayGroupRelations',
      {
        filter: {
          child_type: 'mapOverlayGroup',
          child_id: mapOverlayRelations.map(
            (relation: MapOverlayGroupRelation) => relation.map_overlay_group_id,
          ),
        },
      },
    );
    while (parentMapOverlayRelations.length) {
      // Save the previous relations and fetch another layer
      mapOverlayRelations = mapOverlayRelations.concat(parentMapOverlayRelations);
      parentMapOverlayRelations = await ctx.services.central.fetchResources(
        'mapOverlayGroupRelations',
        {
          filter: {
            child_type: 'mapOverlayGroup',
            child_id: parentMapOverlayRelations.map(
              (relation: MapOverlayGroupRelation) => relation.map_overlay_group_id,
            ),
          },
        },
      );
    }

    // Fetch all the groups we've used
    const mapOverlayGroups = await ctx.services.central.fetchResources('mapOverlayGroups', {
      filter: {
        id: mapOverlayRelations.map(
          (relation: MapOverlayGroupRelation) => relation.map_overlay_group_id,
        ),
      },
    });

    const nestOverlayGroups = (
      relationsByParentId: Record<string, MapOverlayGroupRelation[]>,
      entriesById: Record<string, MapOverlayGroup | MapOverlay>,
      parentEntry: MapOverlayGroup | MapOverlay,
    ): OverlayChild => {
      const childRelations = relationsByParentId[parentEntry.id as string] || [];
      const nestedChildren: OverlayChild[] = childRelations.map(
        (relation: MapOverlayGroupRelation) => {
          if (relation.child_type === 'mapOverlay') {
            return entriesById[relation.child_id];
          }
          return nestOverlayGroups(
            relationsByParentId,
            entriesById,
            entriesById[relation.child_id],
          );
        },
      );
      return { ...parentEntry, children: nestedChildren.length ? nestedChildren : undefined };
    };

    const relationsByParentId = groupBy(mapOverlayRelations, 'map_overlay_group_id');
    const entriesById = keyBy([...mapOverlays, ...mapOverlayGroups], 'id');
    const rootOverlayGroup = mapOverlayGroups.find(
      (group: MapOverlayGroup) => group.code === 'Root',
    );

    const nestedGroups = nestOverlayGroups(relationsByParentId, entriesById, rootOverlayGroup);

    return nestedGroups;
  }
}
