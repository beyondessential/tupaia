import { Request } from 'express';
import groupBy from 'lodash.groupby';
import isEqual from 'lodash.isequal';
import keyBy from 'lodash.keyby';

import { Route } from '@tupaia/server-boilerplate';
import {
  Entity,
  EntityTypeEnum,
  MapOverlay,
  MapOverlayGroup,
  MapOverlayGroupRelation,
  TupaiaWebMapOverlaysRequest,
} from '@tupaia/types';
import { orderBy } from '@tupaia/utils';

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

// This function checks if all the map overlay items have the same reference and if they do, it
// removes the reference from the children and adds it to the info object of the parent
const integrateMapOverlayItemsReference = (children: OverlayChild[]) => {
  const getReference = (mapOverlayItem: OverlayChild) => {
    if (mapOverlayItem.info && mapOverlayItem.info.reference) return mapOverlayItem.info.reference;
    return undefined;
  };

  const firstReference = children[0] && getReference(children[0]);

  const referencesAreTheSame =
    firstReference &&
    children.every(
      mapOverlayItem =>
        getReference(mapOverlayItem) && isEqual(getReference(mapOverlayItem), firstReference),
    );

  if (!referencesAreTheSame) {
    return {
      children,
    };
  }

  // Delete all the same references
  const noReferenceMapOverlayItems: OverlayChild[] = children.map(mapOverlayItem => {
    const { info, ...restValues } = mapOverlayItem;
    if (info) {
      info.reference = undefined;
    }
    return { ...restValues, info };
  });

  return {
    children: noReferenceMapOverlayItems,
    info: { reference: firstReference },
  };
};

export class MapOverlaysRoute extends Route<MapOverlaysRequest> {
  public async buildResponse() {
    const { query, params, ctx, accessPolicy } = this.req;
    const { projectCode, entityCode } = params;
    const { pageSize } = query;

    const entity = await ctx.services.entity.getEntity(projectCode, entityCode);

    const ancestors: Entity[] = await ctx.services.entity.getAncestorsOfEntity(
      projectCode,
      entityCode,
      {
        fields: ['code', 'type'],
      },
    );

    // get the types of the ancestors, excluding the current entity
    const ancestorTypes = ancestors
      .filter(ancestor => ancestor.code !== entityCode)
      .map(ancestor => ancestor.type.toLowerCase().replace('_', ''));

    const rootEntityCode = entity.country_code || entity.code;

    // Do the initial overlay fetch from the central server, since that enforces permissions
    const mapOverlays = (
      await ctx.services.central.fetchResources('mapOverlays', {
        filter: {
          country_codes: {
            comparator: '@>',
            // Project entities do not have a country_code
            comparisonValue: [rootEntityCode],
          },
          project_codes: {
            comparator: '@>',
            comparisonValue: [projectCode],
          },
        },
        pageSize: pageSize || DEFAULT_PAGE_SIZE,
      })
    ).filter(
      // Central returns overlays you can view in at least one of its countries
      // We run an additional filter here to narrow down to the specific country we're requesting for
      (overlay: MapOverlay) =>
        entity.type === EntityTypeEnum.project || // Don't worry about projects, we don't give permissions against them
        !overlay.permission_group || // No permission group means publicly accessible
        accessPolicy.getPermissionGroups([rootEntityCode]).includes(overlay.permission_group), // Filter by country/permission pair
    );

    if (mapOverlays.length === 0) {
      return {
        name: entity.name,
        entityCode: entity.code,
        entityType: entity.type,
        mapOverlays: [],
      };
    }

    // Breaking orchestration server convention and accessing the db directly
    const mapOverlayRelations =
      await this.req.models.mapOverlayGroupRelation.findParentRelationTree(
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

            // If the measure level is found in the ancestor types, that means the currently selected entity is a descendant of the measure level entity, so there will be no data to display. In this case, the overlay should be disabled.
            const isDisabled = overlay.config.measureLevel
              ? ancestorTypes.includes(overlay.config.measureLevel.toLowerCase())
              : false;
            // Translate Map Overlay
            return {
              name: overlay.name,
              code: overlay.code,
              reportCode: overlay.report_code,
              legacy: overlay.legacy,
              sortOrder: relation.sort_order,
              entityAttributesFilter: overlay.entity_attributes_filter,
              disabled: isDisabled,
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
      const { children, info } = integrateMapOverlayItemsReference(nestedChildren);

      return {
        name: parentEntry.name,
        info,
        children: orderBy(children, [
          child => (child.sortOrder === null ? 1 : 0), // Puts null values last
          'sortOrder',
          'name',
        ]).map(child => {
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
