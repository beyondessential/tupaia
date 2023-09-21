/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { LegendProps, MeasureData, POLYGON_MEASURE_TYPES, Series } from '@tupaia/ui-map-components';
import { useParams } from 'react-router';
import { useEntitiesWithLocation, useEntity, useMapOverlayReport } from '../../../api/queries';
import { processMeasureData } from '../MapOverlays/processMeasureData';
import { useMapOverlays } from '../../../api/queries';
import { Entity, EntityCode, ProjectCode } from '../../../types';
import { getSnakeCase } from './getSnakeCase';
import { useDateRanges } from '../../../utils';
import { URL_SEARCH_PARAMS } from '../../../constants';

type EntityTypeParam = string | null | undefined;

const useEntitiesByType = (
  projectCode?: ProjectCode,
  entityCode?: EntityCode,
  entityType?: EntityTypeParam | EntityTypeParam[],
) => {
  let config = {
    params: {
      includeRootEntity: true,
      filter: {
        generational_distance: {
          comparator: '<=',
          comparisonValue: 1,
        },
      },
    },
  };
  if (entityType) {
    const entityTypeArray = (Array.isArray(entityType) ? entityType : [entityType]).filter(
      type => !!type,
    );
    const snakeCaseEntityTypes = entityTypeArray?.map(type => getSnakeCase(type!));
    config = {
      params: {
        // Don't include the root entity in the list of entities for displaying data as the
        // data visuals are for children of the root entity, unless it is a root entity, ie. a country
        includeRootEntity: snakeCaseEntityTypes?.includes('country') ? true : false,
        // includeRootEntity: true,
        filter: {
          type: snakeCaseEntityTypes?.join(','),
        },
      },
    };
  }

  return useEntitiesWithLocation(projectCode, entityCode, config);
};

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

const useRelatives = (projectCode, activeEntity, isPolygonSerieses) => {
  const rootEntityCode = activeEntity?.parentCode ? activeEntity?.parentCode : activeEntity?.code;
  const generationalDistance = activeEntity?.parentCode ? 2 : 1;
  const { data } = useEntitiesWithLocation(projectCode, rootEntityCode, {
    params: {
      includeRootEntity: false,
      filter: {
        generational_distance: {
          comparator: '<=',
          comparisonValue: generationalDistance,
        },
      },
    },
  });
  console.log('data', data);

  const filteredData = data
    ?.filter(entity => entity.code !== activeEntity?.code)
    .filter(entity => {
      if (isPolygonSerieses) {
        return entity.type === activeEntity.type;
      }
      return entity.parentCode === activeEntity.code || entity.type === activeEntity.type;
    });

  console.log('filteredData', filteredData);
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

  console.log('selectedOverlay', selectedOverlay);
  const isPolygonSerieses = POLYGON_MEASURE_TYPES.includes(selectedOverlay?.displayType);

  const { data: entity } = useEntity(projectCode, entityCode);

  const rootEntityCode = rootEntity?.code || getRootEntityCode(entity);

  const { data: entityRelatives } = useRelatives(projectCode, entity, isPolygonSerieses);

  const {
    data: entities,
    isLoading: isLoadingEntities,
    isFetched: isFetchedEntities,
  } = useEntitiesByType(projectCode, rootEntityCode, selectedOverlay?.measureLevel);

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

  const combinedEntities = [...(entities || []), ...(entityRelatives || [])];

  const processedMeasureData = processMeasureData({
    activeEntityCode: entityCode,
    entitiesData: combinedEntities,
    measureData: data?.measureData,
    serieses: data?.serieses?.sort((a: Series, b: Series) => a.key.localeCompare(b.key)), // previously this was keyed and so ended up being alphabetised, so we need to sort to match the previous way of displaying series data
    hiddenValues: hiddenValues ? hiddenValues : {},
    includeEntitiesWithoutCoordinates: rootEntity ? true : false,
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
