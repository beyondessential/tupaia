/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { LegendProps, MeasureData, Series } from '@tupaia/ui-map-components';
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
  const entityTypeArray = (Array.isArray(entityType) ? entityType : [entityType]).filter(
    type => !!type,
  );
  const snakeCaseEntityTypes = entityTypeArray?.map(type => getSnakeCase(type!));
  return useEntitiesWithLocation(
    projectCode,
    entityCode,
    {
      params: {
        // Don't include the root entity in the list of entities for displaying data as the
        // data visuals are for children of the root entity, unless it is a root entity, ie. a country
        includeRootEntity: snakeCaseEntityTypes?.includes('country') ? true : false,
        filter: {
          type: snakeCaseEntityTypes?.join(','),
        },
      },
    },
    { enabled: !!entityType },
  );
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

  const rootEntityCode = rootEntity?.code || getRootEntityCode(entity);

  const { data: entities } = useEntitiesByType(
    projectCode,
    rootEntityCode,
    selectedOverlay?.measureLevel,
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

  const isLoadingData = isLoading || (!isIdle && !isFetched && !!selectedOverlay);

  if (!entities || !data) {
    return {
      isLoading: isLoadingData,
    };
  }

  const processedMeasureData = processMeasureData({
    entitiesData: entities,
    measureData: data.measureData,
    serieses: [...data.serieses]?.sort((a: Series, b: Series) => a.key.localeCompare(b.key)), // previously this was keyed and so ended up being alphabetised, so we need to sort to match the previous way of displaying series data
    hiddenValues: hiddenValues ? hiddenValues : {},
    includeEntitiesWithoutCoordinates: rootEntity ? true : false,
  }) as MeasureData[];

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
