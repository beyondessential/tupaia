/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import {
  MapOverlay,
  MapOverlayGroup,
  MapOverlayGroupRelation,
  TupaiaWebMapOverlaysRequest,
} from '@tupaia/types';
import groupBy from 'lodash.groupby';
import keyBy from 'lodash.keyby';

export type MapOverlaysRequest = Request<
  TupaiaWebMapOverlaysRequest.Params,
  TupaiaWebMapOverlaysRequest.ResBody,
  TupaiaWebMapOverlaysRequest.ReqBody,
  TupaiaWebMapOverlaysRequest.ReqQuery
>;
type TranslatedMapOverlayGroup = TupaiaWebMapOverlaysRequest.TranslatedMapOverlayGroup;
type OverlayChild = TupaiaWebMapOverlaysRequest.OverlayChild;

// TODO: Can these be moved into types?
const ROOT_MAP_OVERLAY_CODE = 'Root';
const MAP_OVERLAY_CHILD_TYPE = 'mapOverlay';
// Central server defaults to 100 record limit, this overrides that
const DEFAULT_PAGE_SIZE = 'ALL';

export class MapOverlaysRoute extends Route<MapOverlaysRequest> {
  public async buildResponse() {
    const { query, params, ctx } = this.req;
    const { projectCode, entityCode } = params;
    const { pageSize } = query;

    const entity = await ctx.services.entity.getEntity(projectCode, entityCode);
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
      pageSize: pageSize || DEFAULT_PAGE_SIZE,
    });

    if (mapOverlays.length === 0) {
      return {
        name: entity.name,
        entityCode: entity.code,
        entityType: entity.type,
        mapOverlays: [],
      };
    }

    // Map overlay groups can be nested so we need to keep
    // searching until we find the root groups
    let mapOverlayRelations = await ctx.services.central.fetchResources(
      'mapOverlayGroupRelations',
      {
        filter: {
          child_type: 'mapOverlay',
          child_id: mapOverlays.map((overlay: MapOverlay) => overlay.id),
        },
        pageSize: DEFAULT_PAGE_SIZE,
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
        pageSize: DEFAULT_PAGE_SIZE,
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
          pageSize: DEFAULT_PAGE_SIZE,
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

    // Convert our multiple flat lists into a single nested object
    const nestOverlayGroups = (
      relationsByParentId: Record<string, MapOverlayGroupRelation[]>,
      groupsById: Record<string, MapOverlayGroup>,
      overlaysById: Record<string, MapOverlay>,
      parentEntry: MapOverlayGroup,
    ): TranslatedMapOverlayGroup => {
      const childRelations = relationsByParentId[parentEntry.id as string] || [];
      // groupBy does not guarantee order, so we can't sort before this
      childRelations.sort(
        (a: MapOverlayGroupRelation, b: MapOverlayGroupRelation) =>
          (a.sort_order || 0) - (b.sort_order || 0),
      );
      const nestedChildren: OverlayChild[] = childRelations.map(
        (relation: MapOverlayGroupRelation) => {
          if (relation.child_type === MAP_OVERLAY_CHILD_TYPE) {
            const overlay = overlaysById[relation.child_id];
            // Translate Map Overlay
            return {
              name: overlay.name,
              code: overlay.code,
              reportCode: overlay.report_code,
              legacy: overlay.legacy,
              ...overlay.config,
            };
          }
          return nestOverlayGroups(
            relationsByParentId,
            groupsById,
            overlaysById,
            groupsById[relation.child_id],
          );
        },
      );
      // Translate Map Overlay Group
      return {
        name: parentEntry.name,
        children: nestedChildren,
      };
    };

    const relationsByParentId = groupBy(mapOverlayRelations, 'map_overlay_group_id');
    const groupsById = keyBy(mapOverlayGroups, 'id');
    const overlaysById = keyBy(mapOverlays, 'id');
    const rootOverlayGroup = mapOverlayGroups.find(
      (group: MapOverlayGroup) => group.code === ROOT_MAP_OVERLAY_CODE,
    );

    const nestedGroups = nestOverlayGroups(
      relationsByParentId,
      groupsById,
      overlaysById,
      rootOverlayGroup,
    );

    return {
      name: entity.name,
      entityCode: entity.code,
      entityType: entity.type,
      // We know the first layer is 'root', so return the second
      mapOverlays: nestedGroups.children,
    };
  }
}
