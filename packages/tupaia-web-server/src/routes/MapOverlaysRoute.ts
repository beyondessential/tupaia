/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import groupBy from 'lodash.groupby';

// TODO: WAITP-1278 split request types to types package
// (And actually define it)
export type MapOverlaysRequest = Request<any, any, any, any>;

export class MapOverlaysRoute extends Route<MapOverlaysRequest> {
  public async buildResponse() {
    const { params, ctx } = this.req;
    const { projectCode, entityCode } = params;

    const project = (
      await ctx.services.central.fetchResources('projects', {
        filter: { code: projectCode },
        columns: JSON.stringify(['entity_hierarchy.name']),
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
    const mapOverlayRelations = await ctx.services.central.fetchResources(
      'mapOverlayGroupRelations',
      {
        filter: {
          child_type: 'mapOverlay',
          child_id: mapOverlays.map((mo: any) => mo.id),
        },
      },
    );
    let parentMapOverlayRelations = await ctx.services.central.fetchResources(
      'mapOverlayGroupRelations',
      {
        filter: {
          child_type: 'mapOverlayGroup',
          child_id: mapOverlayRelations.map((mo: any) => mo.parent_id),
        },
      },
    );
    while (parentMapOverlayRelations.length) {
      // Save the previous relations and fetch another layer
      mapOverlayRelations.concat(parentMapOverlayRelations);
      parentMapOverlayRelations = await ctx.services.central.fetchResources(
        'mapOverlayGroupRelations',
        {
          filter: {
            child_type: 'mapOverlayGroup',
            child_id: mapOverlayRelations.map((mo: any) => mo.parent_id),
          },
        },
      );
    }
    // This is now the list of all mapOverlayGroupRelations between our mapOverlays and root
    mapOverlayRelations.concat(parentMapOverlayRelations);

    const mapOverlayGroups = await ctx.services.central.fetchResources('mapOverlayGroups', {
      filter: {
        id: mapOverlayRelations.map((mor: any) => mor.map_overlay_group_id),
      },
    });

    const relationsByChild = groupBy(mapOverlayRelations, 'child_id');
    const groupsWithParent = mapOverlayGroups.map(group => ({
      ...group,
      parentId: relationsByChild[group.id].map_overlay_group_id,
    }));

    // Convert the flat list to a nested array
    const nestMapOverlays = (relationsByParent: Record<string, any>, mapOverlayGroup: any) => {
      const childrenRelations = relationsByParent[mapOverlayGroup.id] || [];
      const children = childrenRelations.map(
        ({ child_id }) => groupsById[child_id] || overlaysById[child_id],
      );
      const nestedChildren = children.map(child => {
        nestMapOverlays(relationsByParent, child);
      });
    };

    return mapOverlays;
  }
}
