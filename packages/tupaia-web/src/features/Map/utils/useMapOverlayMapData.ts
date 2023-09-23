/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useParams } from 'react-router';
import { useEntitiesWithLocation, useEntity, useMapOverlays } from '../../../api/queries';
import { useMapOverlayTableData } from './useMapOverlayTableData.ts';
import { Entity } from '../../../types';

const useNavigationEntities = (projectCode, activeEntity, isPolygonSerieses) => {
  const rootEntityCode = activeEntity?.parentCode || activeEntity?.code;
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
      return entity.type === activeEntity.type;
    }
    // Point map overlay types
    return entity.parentCode === activeEntity.code || entity.type === activeEntity.type;
  });

  return { data: filteredData };
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

export const useMapOverlayMapData = hiddenValues => {
  const { projectCode, entityCode } = useParams();
  const { data: entity } = useEntity(projectCode, entityCode);
  const { selectedOverlay, isPolygonSerieses } = useMapOverlays(projectCode, entityCode);
  const { data: entityRelatives } = useNavigationEntities(projectCode, entity, isPolygonSerieses);

  const relativesMeasureData = entityRelatives?.map(entity => {
    return {
      ...entity,
      organisationUnitCode: entity.code,
      coordinates: entity.point,
      region: entity.region,
      permanentTooltip: !selectedOverlay,
    };
  });

  const rootEntityCode = getRootEntityCode(entity);

  const mapOverlayData = useMapOverlayTableData({ hiddenValues, rootEntityCode });

  // Combine the entities and relatives. The entities need to come after the entityRelatives so
  // that the active entity is rendered on top of the relatives
  const measureData = [...(relativesMeasureData || []), ...(mapOverlayData?.measureData || [])];

  return { ...mapOverlayData, measureData };
};
