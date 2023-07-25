/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useParams } from 'react-router';
import {
  useMapOverlays,
  useMapOverlayReport as useMapOverlayReportQuery,
  useEntitiesWithLocation,
  useEntity,
} from '../../../api/queries';
import { useDateRanges } from '../../../utils';
import { URL_SEARCH_PARAMS } from '../../../constants';
import { getSnakeCase } from './getSnakeCase';
import { Entity, EntityCode, ProjectCode } from '../../../types';

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
    return null;
  }
  // @ts-ignore
  const { parentCode, code, type } = entity;

  if (type === 'country' || !parentCode) {
    return code;
  }

  return parentCode;
};

export const useActiveMapOverlayReport = () => {
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

  return {
    ...data,
    serieses: data?.serieses,
    measureData: data?.measureData,
    entities,
    activeEntity: entity,
  };
};
