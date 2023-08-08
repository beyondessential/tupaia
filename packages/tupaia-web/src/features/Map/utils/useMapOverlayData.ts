/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { LegendProps, MeasureData } from '@tupaia/ui-map-components';
import { useParams } from 'react-router';
import {
  useEntitiesWithLocation,
  useEntity,
  useMapOverlayReport as useMapOverlayReportQuery,
} from '../../../api/queries';
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
  return useEntitiesWithLocation(
    projectCode,
    entityCode,
    {
      params: {
        // Don't include the root entity in the list of entities for displaying data as the
        // data visuals are for children of the root entity
        includeRootEntity: false,
        filter: {
          type: getSnakeCase(entityType!),
        },
      },
    },
    { enabled: !!entityType },
  );
};

const getRootEntity = (entity?: Entity) => {
  if (!entity) {
    return undefined;
  }
  const { parentCode, code, type } = entity;

  if (type === 'country' || !parentCode) {
    return code;
  }

  return parentCode;
};

export const useMapOverlayData = (hiddenValues?: LegendProps['hiddenValues']) => {
  const { projectCode, entityCode } = useParams();
  const { selectedOverlay } = useMapOverlays(projectCode, entityCode);
  const { startDate, endDate } = useDateRanges(
    URL_SEARCH_PARAMS.MAP_OVERLAY_PERIOD,
    selectedOverlay,
  );
  const { data: entity } = useEntity(projectCode, entityCode);
  const entityDataCode = getRootEntity(entity);

  const { data: entities } = useEntitiesByType(
    projectCode,
    entityDataCode,
    selectedOverlay?.measureLevel,
  );

  const { data } = useMapOverlayReportQuery(projectCode, entityDataCode, selectedOverlay, {
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
  }) as MeasureData[];

  return {
    ...data,
    serieses: data?.serieses,
    measureData: processedMeasureData,
    entities,
    activeEntity: entity,
  };
};
