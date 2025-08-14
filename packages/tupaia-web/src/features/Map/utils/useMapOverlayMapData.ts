import { useParams } from 'react-router';
import {
  useEntitiesWithLocation,
  useEntity,
  useEntityAncestors,
  useMapOverlays,
} from '../../../api/queries';
import { Entity } from '../../../types';
import { useMapOverlayTableData } from './useMapOverlayTableData';

/**
 * If the entity is a point, filter it out so that we don’t end up with
 * navigation points showing no data type. This ensures that the only points on
 * the map are from an overlay.
 *
 * @see https://linear.app/bes/issue/RN-1328/entities-can-appear-as-black-smudges-on-map
 */
const filterOutPointEntities = (entities: Entity[]) => {
  return entities.filter(entity => entity.locationType !== 'point');
};

const useEntityRelativesWithLocation = (projectCode, entityCode, enabled) => {
  return useEntitiesWithLocation(
    projectCode,
    entityCode,
    {
      params: {
        includeRootEntity: false,
        filter: {
          generational_distance: 1,
        },
      },
    },
    {
      enabled,
      // filter the point entities here because location_type is not a valid filter in the entity-server
      select: filterOutPointEntities,
    },
  );
};

/*
 * This hook is used to get the sibling and immediate child entities for displaying navigation polygons on the map
 */
const useNavigationEntities = (
  projectCode,
  activeEntity,
  isPolygonOverlayData,
  measureLevel,
  displayOnLevel,
) => {
  const rootEntityCode = activeEntity?.parentCode || activeEntity?.code;

  // Get siblings for the root entity
  const { data: siblings = [] } = useEntityRelativesWithLocation(
    projectCode,
    rootEntityCode,
    !!rootEntityCode,
  );

  // Get immediate children for the selected entity
  const { data: children = [] } = useEntityRelativesWithLocation(
    projectCode,
    activeEntity?.code,
    !!activeEntity?.code && activeEntity?.code !== rootEntityCode,
  );

  const entitiesData = [...siblings, ...children];
  // If display on level is set, we don't want to show the sibling entities because this would cause slow load times, which displayOnLevel is aiming to fix. Also, don't show child entities if the current entity is the same as 'displayAtLevel', because we would end up with extra entities on the map
  if (displayOnLevel)
    return activeEntity?.type?.replace('_', '') === displayOnLevel.toLowerCase() ? [] : children;

  // Don't show nav entities for the selected measure level or for points
  const filteredData = entitiesData?.filter(entity => {
    if (!measureLevel) return true;
    // handle edge cases of array measure levels
    if (Array.isArray(measureLevel))
      return !measureLevel.map(level => level.toLowerCase()).includes(entity.type.toLowerCase());
    return measureLevel?.toLowerCase() !== entity.type.toLowerCase();
  });

  // For polygon overlays, show navigation polygons for sibling entities only
  if (isPolygonOverlayData) {
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

  // if displayAtLevel is set, look for the entity at that level
  if (displayOnLevel) {
    const measure = entityAncestors?.find(
      entityAncestor => entityAncestor.type.replace('_', '') === displayOnLevel?.toLowerCase(),
    );
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
      entityAncestor => entityAncestor.type === measureLevel?.toLowerCase(),
    );

    return measure?.parentCode;
  }

  // The default behaviour is to show visuals from the parent down which means that visuals will normally
  // show for entities outside the active entity.
  return parentCode;
};

export const useMapOverlayMapData = (hiddenValues = {}) => {
  const { projectCode, entityCode } = useParams();
  const { data: entity } = useEntity(projectCode, entityCode);
  const { selectedOverlay } = useMapOverlays(projectCode, entityCode);

  const rootEntityCode = useRootEntityCode(
    entity,
    selectedOverlay?.measureLevel,
    selectedOverlay?.displayOnLevel,
  );

  // Get the main visual entities (descendants of root entity for the selected visual) and their data for displaying the visual
  const mapOverlayData = useMapOverlayTableData({ hiddenValues, rootEntityCode });

  // Check if the data is polygon data. Default to false if there is no data
  const isPolygonOverlayData =
    mapOverlayData?.measureData
      ?.filter(measure => measure.locationType !== 'no-coordinates')
      .some(measure => !!measure.region) ?? false;

  const entityRelatives = useNavigationEntities(
    projectCode,
    entity,
    isPolygonOverlayData,
    selectedOverlay?.measureLevel,
    selectedOverlay?.displayOnLevel,
  );

  const getEntityRelativeIsVisible = (entityRelative: Entity) => {
    // Check if the entity is already in the main visual entities and return false if it is to deduplicate entities so that we don't end up with a navigation entity under a measure entity
    const isInVisualEntities = mapOverlayData?.measureData?.find(
      item => item.code === entityRelative.code,
    );

    return !isInVisualEntities;
  };

  // Get the relatives (siblings and immediate children) of the active entity for displaying navigation polygons
  const relativesMeasureData = entityRelatives
    ?.filter(getEntityRelativeIsVisible)
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
