/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { LegendProps, MeasureData, Series } from '@tupaia/ui-map-components';
import { useParams } from 'react-router';
import { useEntitiesWithLocation, useEntity, useMapOverlayReport } from '../../../api/queries';
import { processMeasureData } from './processMeasureData';
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
  // Don't include the root entity in the list of entities for displaying data as the
  // data visuals are for children of the root entity, unless it is a root entity, ie. a country
  const includeRootEntity = isPolygonSerieses && measureLevel?.includes('Country');
  return useEntitiesWithLocation(
    projectCode,
    rootEntityCode,
    {
      params: {
        includeRootEntity,
        filter: {
          generational_distance: 2,
          type: measureLevel,
        },
      },
    },
    { enabled: !!measureLevel },
  );
};

export const useMapOverlayData = (
  hiddenValues?: LegendProps['hiddenValues'] | null,
  rootEntity?: Entity,
) => {
  const { projectCode, entityCode } = useParams();
  const { selectedOverlay, isPolygonSerieses } = useMapOverlays(projectCode, entityCode);
  const { startDate, endDate } = useDateRanges(
    URL_SEARCH_PARAMS.MAP_OVERLAY_PERIOD,
    selectedOverlay,
  );
  const { data: entity } = useEntity(projectCode, entityCode);
  const rootEntityCode = rootEntity?.code || getRootEntityCode(entity);

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

  const processedMeasureData = processMeasureData({
    activeEntityCode: entityCode,
    entitiesData: entities!,
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
    activeEntity: entity,
  };
};
