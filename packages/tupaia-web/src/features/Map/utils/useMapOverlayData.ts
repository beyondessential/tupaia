/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { LegendProps, MeasureData } from '@tupaia/ui-map-components';
import { useParams } from 'react-router';
import { useEntitiesWithLocation, useEntity, useMapOverlayReport } from '../../../api/queries';
import { processMeasureData } from '../MapOverlays/processMeasureData';
import { useMapOverlays } from '../../../api/queries';
import { Entity, EntityCode, ProjectCode } from '../../../types';
import { getSnakeCase } from './getSnakeCase';
import { useDateRanges } from '../../../utils';
import { URL_SEARCH_PARAMS } from '../../../constants';

const useEntitiesByType = (
  projectCode?: ProjectCode,
  entityCode?: EntityCode,
  entityType?: string | null,
) => {
  const snakeCaseEntityType = getSnakeCase(entityType!);
  return useEntitiesWithLocation(
    projectCode,
    entityCode,
    {
      params: {
        // Don't include the root entity in the list of entities for displaying data as the
        // data visuals are for children of the root entity, unless it is a root entity, ie. a country
        includeRootEntity: snakeCaseEntityType === 'country',
        filter: {
          type: snakeCaseEntityType,
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

  const { data } = useMapOverlayReport(projectCode, rootEntityCode, selectedOverlay, {
    startDate,
    endDate,
  });

  if (!entities || !data) {
    return {};
  }

  const processedMeasureData = processMeasureData({
    entitiesData: entities,
    measureData: data.measureData,
    serieses: data.serieses,
    hiddenValues: hiddenValues ? hiddenValues : {},
    includeEntitiesWithoutCoordinates: rootEntity ? true : false,
  }) as MeasureData[];

  return {
    ...data,
    serieses: data?.serieses,
    measureData: processedMeasureData,
    entities,
    activeEntity: entity,
  };
};
