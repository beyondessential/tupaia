/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useParams } from 'react-router';
import {
  useEntitiesWithLocation,
  useEntity,
  useEntityAncestors,
  useMapOverlays,
} from '../../../api/queries';
import { useMapOverlayTableData } from './useMapOverlayTableData';
import { Entity } from '../../../types';

/*
 * This hook is used to get the sibling and immediate child entities for displaying navigation polygons on the map
 */
const useNavigationEntities = (
  projectCode,
  activeEntity,
  isPolygonSerieses,
  measureLevel,
  displayOnLevel,
) => {
  const rootEntityCode = activeEntity?.parentCode || activeEntity?.code;

  // Get siblings for the root entity
  const { data: siblings = [] } = useEntitiesWithLocation(
    projectCode,
    rootEntityCode,
    {
      params: {
        includeRootEntity: false,
        filter: {
          generational_distance: 1,
        },
      },
    },
    { enabled: !!rootEntityCode },
  );

  // Get immediate children for the selected entity
  // If the root entity is the active entity, react-query will automatically de-dupe the requests
  const { data: children = [] } = useEntitiesWithLocation(
    projectCode,
    activeEntity?.code,
    {
      params: {
        includeRootEntity: false,
        filter: {
          generational_distance: 1,
        },
      },
    },
    { enabled: !!activeEntity?.code },
  );

  const entitiesData = [...siblings, ...children];

  // If display on level is set, we don't want to show the sibling entities because this would cause slow load times, which displayOnLevel is aiming to fix
  if (displayOnLevel) return [];

  // Don't show nav entities for the selected measure level
  const filteredData = entitiesData?.filter(entity => {
    if (!measureLevel) return true;
    // handle edge cases of array measure levels
    if (Array.isArray(measureLevel))
      return !measureLevel.map(level => level.toLowerCase()).includes(entity.type.toLowerCase());
    return measureLevel?.toLowerCase() !== entity.type.toLowerCase();
  });

  // For polygon overlays, show navigation polygons for sibling entities only
  if (isPolygonSerieses) {
    return filteredData?.filter(entity => entity.type === activeEntity.type);
  }

  // For point overlays or no selected overlay,
  // show navigation polygons for sibling entities and immediate children
  return filteredData?.filter(
    entity => entity.parentCode === activeEntity.code || entity.type === activeEntity.type,
  );
};

const useRootEntityCode = (entity, measureLevel, displayOnLevel) => {
  const { projectCode, entityCode } = useParams();
  const { data: entityAncestors } = useEntityAncestors(projectCode, entityCode);
  if (!entity) {
    return undefined;
  }
  const { parentCode, code, type } = entity;

  if (displayOnLevel) {
    const measure = entityAncestors?.find(
      (entity: Entity) => entity.type.replace('_', '') === displayOnLevel?.toLowerCase(),
    ) as Entity;
    return measure?.code;
  }
  // If the active entity is a country we don't show visuals for neighbouring countries, so just make
  // the root entity the country
  if (type === 'country' || !parentCode) {
    return code;
  }

  // if is non-spatial, find the parent at the measure level and set that as the parent as the rootEntity code, and it will handle getting the correct entities for the selected measure level, similar to how the overlay table does
  if (!entity.point && !entity.bounds) {
    const measure = entityAncestors?.find(
      (entity: Entity) => entity.type === measureLevel?.toLowerCase(),
    ) as Entity;

    return measure?.parentCode;
  }

  // The default behaviour is to show visuals from the parent down which means that visuals will normally
  // show for entities outside the active entity.
  return parentCode;
};

export const useMapOverlayMapData = (hiddenValues = {}) => {
  const { projectCode, entityCode } = useParams();
  const { data: entity } = useEntity(projectCode, entityCode);
  const { selectedOverlay, isPolygonSerieses } = useMapOverlays(projectCode, entityCode);
  const entityRelatives = useNavigationEntities(
    projectCode,
    entity,
    isPolygonSerieses,
    selectedOverlay?.measureLevel,
    selectedOverlay?.displayOnLevel,
  );

  const rootEntityCode = useRootEntityCode(
    entity,
    selectedOverlay?.measureLevel,
    selectedOverlay?.displayOnLevel,
  );

  // Get the main visual entities (descendants of root entity for the selected visual) and their data for displaying the visual
  const mapOverlayData = useMapOverlayTableData({ hiddenValues, rootEntityCode });
  // Get the relatives (siblings and immediate children) of the active entity for displaying navigation polygons
  const relativesMeasureData = entityRelatives
    ?.filter(
      entityRelative =>
        !mapOverlayData?.measureData?.find(item => item.code === entityRelative.code),
    ) // deduplicate entities so that we don't end up with a navigation entity under a measure entity
    .map(entityRelative => {
      return {
        ...entityRelative,
        organisationUnitCode: entityRelative.code,
        coordinates: entityRelative.point,
        region: entityRelative.region,
        permanentTooltip: !selectedOverlay || mapOverlayData?.isLoading,
      };
    });

  // Combine the main visual entities and relatives for the polygon layer. The entities need to come after the
  // entityRelatives so that the active entity is rendered on top of the relatives
  const measureData = [...(relativesMeasureData || []), ...(mapOverlayData?.measureData || [])];

  return { ...mapOverlayData, measureData };
};
