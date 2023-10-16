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
import { orderBy } from '@tupaia/utils';
import groupBy from 'lodash.groupby';
import keyBy from 'lodash.keyby';
import isEqual from 'lodash.isequal';

export type MapOverlaysRequest = Request<
  TupaiaWebMapOverlaysRequest.Params,
  TupaiaWebMapOverlaysRequest.ResBody,
  TupaiaWebMapOverlaysRequest.ReqBody,
  TupaiaWebMapOverlaysRequest.ReqQuery
>;
type TranslatedMapOverlay = TupaiaWebMapOverlaysRequest.TranslatedMapOverlay;
type TranslatedMapOverlayGroup = TupaiaWebMapOverlaysRequest.TranslatedMapOverlayGroup;
type OverlayChild = TupaiaWebMapOverlaysRequest.OverlayChild;

// TODO: Can these be moved into types?
const ROOT_MAP_OVERLAY_CODE = 'Root';
const MAP_OVERLAY_CHILD_TYPE = 'mapOverlay';

const DEFAULT_PAGE_SIZE = 'ALL';

/**
 * We will only display reference info on topper level map overlay group, if all `mapOverlayItem` have same reference.
 *
 * In this function, variable `mapOverlayItem` is an abstract item that can be either map overlay or map overlay group
 *
 * @param children an array of variable `mapOverlayItem`
 */

const getReference = (mapOverlayItem: any) => {
  if (mapOverlayItem.info && mapOverlayItem.info.reference) return mapOverlayItem.info.reference;
  return null;
};

const integrateMapOverlayItemsReference = (children: OverlayChild[]) => {
  const firstReference = Array.isArray(children) && children[0] && getReference(children[0]);

  if (!firstReference) {
    return {
      children,
    };
  }

  const referencesAreTheSame = children.every(
    mapOverlayItem =>
      getReference(mapOverlayItem) && isEqual(getReference(mapOverlayItem), firstReference),
  );

  // All map overlays have same reference
  if (referencesAreTheSame) {
    // Delete all the same references
    const noReferenceMapOverlayItems = children.map(mapOverlayItem => {
      const { info, ...restValues } = mapOverlayItem;
      // @ts-ignore
      delete info['reference'];
      return { ...restValues, info };
    });
    return {
      children: noReferenceMapOverlayItems,
      info: { reference: firstReference },
    };
  }
};

export class MapOverlaysRoute extends Route<MapOverlaysRequest> {
  public async buildResponse() {
    const { query, params, ctx } = this.req;
    const { projectCode, entityCode } = params;
    const { pageSize } = query;

    const entity = await ctx.services.entity.getEntity(projectCode, entityCode);
    // Do the initial overlay fetch from the central server, since that enforces permissions
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

    // Breaking orchestration server convention and accessing the db directly
    const mapOverlayRelations = await this.req.models.mapOverlayGroupRelation.findParentRelationTree(
      mapOverlays
        .filter((overlay: MapOverlay) => !overlay.config?.hideFromMenu)
        .map((overlay: MapOverlay) => overlay.id),
    );

    // Fetch all the groups we've used
    const overlayGroupIds: string[] = mapOverlayRelations.map(
      (relation: MapOverlayGroupRelation) => relation.map_overlay_group_id,
    );
    const uniqueGroupIds: string[] = [...new Set(overlayGroupIds)];
    const mapOverlayGroups = await this.req.models.mapOverlayGroup.find({
      id: uniqueGroupIds,
    });
    // Convert our multiple flat lists into a single nested object
    const nestOverlayGroups = (
      relationsByParentId: Record<string, MapOverlayGroupRelation[]>,
      groupsById: Record<string, MapOverlayGroup>,
      overlaysById: Record<string, MapOverlay>,
      parentEntry: MapOverlayGroup,
    ): TranslatedMapOverlayGroup => {
      const childRelations = relationsByParentId[parentEntry.id as string] || [];
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
              sortOrder: relation.sort_order,
              ...overlay.config,
            } as TranslatedMapOverlay;
          }
          return {
            ...nestOverlayGroups(
              relationsByParentId,
              groupsById,
              overlaysById,
              groupsById[relation.child_id],
            ),
            sortOrder: relation.sort_order,
          };
        },
      );

      // Translate Map Overlay Group
      // @ts-ignore
      const { children, info } = integrateMapOverlayItemsReference(nestedChildren);

      return {
        name: parentEntry.name,
        info,
        children: orderBy(children, [
          (child: OverlayChild) => (child.sortOrder === null ? 1 : 0), // Puts null values last
          'sortOrder',
          'name',
        ]).map((child: OverlayChild) => {
          // We only needed the sortOrder for sorting, strip it before we return
          const { sortOrder, ...restOfChild } = child;
          return restOfChild;
        }),
      };
    };

    const relationsByParentId = groupBy(mapOverlayRelations, 'map_overlay_group_id');
    const groupsById = keyBy(mapOverlayGroups, 'id');
    const overlaysById = keyBy(mapOverlays, 'id');
    const rootOverlayGroup = mapOverlayGroups.find(
      (group: MapOverlayGroup) => group.code === ROOT_MAP_OVERLAY_CODE,
    );

    const nestedGroups =
      rootOverlayGroup &&
      nestOverlayGroups(relationsByParentId, groupsById, overlaysById, rootOverlayGroup);

    return {
      name: entity.name,
      entityCode: entity.code,
      entityType: entity.type,
      // Map overlays always exist beneath a group, so we know the first layer is only groups
      mapOverlays: (nestedGroups?.children as TranslatedMapOverlayGroup[]) || [],
    };
  }
}
