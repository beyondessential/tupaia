/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { LegendProps, MeasureData, POLYGON_MEASURE_TYPES, Series } from '@tupaia/ui-map-components';
import { useParams } from 'react-router';
import { useEntitiesWithLocation, useEntity, useMapOverlayReport } from '../../../api/queries';
import { processMeasureData } from '../MapOverlaysLayer/processMeasureData';
import { useMapOverlays } from '../../../api/queries';
import { Entity, EntityCode, ProjectCode } from '../../../types';
import { useDateRanges } from '../../../utils';
import { URL_SEARCH_PARAMS } from '../../../constants';

type EntityTypeParam = string | null | undefined;

const getRootEntityCode = (entity?: Entity) => {
  if (!entity) {
    return undefined;
  }
  const { parentCode, code, type } = entity;

  if (type === 'country' || !parentCode) {
    return code;
  }

  return parentCode;
};

const useDataDisplayEntities = (
  projectCode?: ProjectCode,
  rootEntityCode?: EntityCode,
  measureLevel?: EntityTypeParam | EntityTypeParam[],
  isPolygonSerieses?: boolean,
) => {
  let type;
  let includeRootEntity = false;
  let generationalDistance = 1;

  if (measureLevel) {
    type = measureLevel;
    // Don't include the root entity in the list of entities for displaying data as the
    // data visuals are for children of the root entity, unless it is a root entity, ie. a country
    includeRootEntity = isPolygonSerieses && type.includes('Country');
    generationalDistance = 2;
  }

  return useEntitiesWithLocation(projectCode, rootEntityCode, {
    params: {
      includeRootEntity,
      filter: {
        generational_distance: generationalDistance,
        type,
      },
    },
  });
};

const useNavigationEntities = (projectCode, activeEntity, isPolygonSerieses) => {
  const rootEntityCode = activeEntity?.parentCode;
  const { data } = useEntitiesWithLocation(
    projectCode,
    rootEntityCode,
    {
      params: {
        // This assumes that there are no project level visualisations that have measure level other than country
        includeRootEntity: false,
        filter: {
          generational_distance: 2,
        },
      },
    },
    { enabled: !!rootEntityCode },
  );

  const filteredData = data?.filter(entity => {
    if (isPolygonSerieses) {
      return entity.type === activeEntity.type && entity.code !== activeEntity?.code;
    }
    // Point map overlay types
    return entity.parentCode === activeEntity.code || entity.type === activeEntity.type;
  });

  return { data: filteredData };
};

// Utility hook for getting data for a map overlay. This accepts optional parameters for hiddenValues, e.g. when legend items are clicked to filter out values, or a rootEntity, e.g. when the data is being fetched for the modal
export const useMapOverlayData = (
  hiddenValues?: LegendProps['hiddenValues'] | null,
  rootEntity?: Entity,
) => {
  const { projectCode, entityCode } = useParams();
  const { selectedOverlay } = useMapOverlays(projectCode, entityCode);
  const { startDate, endDate } = useDateRanges(
    URL_SEARCH_PARAMS.MAP_OVERLAY_PERIOD,
    selectedOverlay,
  );
  const { data: entity } = useEntity(projectCode, entityCode);

  const isPolygonSerieses = POLYGON_MEASURE_TYPES.includes(selectedOverlay?.displayType);
  const rootEntityCode = rootEntity?.code || getRootEntityCode(entity);
  const { data: entityRelatives } = useNavigationEntities(projectCode, entity, isPolygonSerieses);

  const {
    data: entities,
    isLoading: isLoadingEntities,
    isFetched: isFetchedEntities,
  } = useDataDisplayEntities(
    projectCode,
    rootEntityCode,
    selectedOverlay?.measureLevel,
    isPolygonSerieses,
  );

  const { data, isLoading, isFetched, isIdle } = useMapOverlayReport(
    projectCode,
    rootEntityCode,
    selectedOverlay,
    {
      startDate,
      endDate,
    },
  );

  const isLoadingEntitiesData = isLoadingEntities || !isFetchedEntities;

  if (isLoadingEntitiesData) {
    return {
      measureData: [],
      isLoading: true,
    };
  }

  // Combine the entities and relatives. The entities need to come after the entityRelatives so
  // that the active entity is rendered on top of the relatives
  const combinedEntities = [...(entityRelatives || []), ...(entities || [])];

  const processedMeasureData = processMeasureData({
    activeEntityCode: entityCode,
    entitiesData: combinedEntities,
    measureData: data?.measureData,
    serieses: data?.serieses?.sort((a: Series, b: Series) => a.key.localeCompare(b.key)), // previously this was keyed and so ended up being alphabetised, so we need to sort to match the previous way of displaying series data
    hiddenValues: hiddenValues ? hiddenValues : {},
    includeEntitiesWithoutCoordinates: !!rootEntity,
  }) as MeasureData[];

  const isLoadingData = isLoading || (!isIdle && !isFetched && !!selectedOverlay);

  return {
    ...data,
    isLoading: isLoadingData,
    isFetched,
    serieses: data?.serieses,
    measureData: processedMeasureData,
    entities,
    activeEntity: entity,
  };
};
