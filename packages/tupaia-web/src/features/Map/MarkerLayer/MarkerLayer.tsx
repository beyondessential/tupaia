/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { useParams } from 'react-router';
import camelCase from 'camelcase';
import { useLocation, useNavigate } from 'react-router-dom';
import { MarkerLayer as UIMarkerLayer } from '@tupaia/ui-map-components';
import {
  useEntitiesWithLocation,
  useEntity,
  useMapOverlayReport,
  useMapOverlays,
  useProject,
} from '../../../api/queries';
import { EntityCode } from '../../../types';
import { processMeasureData } from './processMeasureData';
import { useDefaultMapOverlay } from './useDefaultMapOverlay';

const useNavigateToDashboard = () => {
  const { projectCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: project } = useProject(projectCode);

  return (entityCode: EntityCode) => {
    const link = {
      ...location,
      pathname: `/${projectCode}/${entityCode}/${project?.dashboardGroupName}`,
    };
    navigate(link);
  };
};

const useEntitiesByMeasureLevel = (measureLevel?: string) => {
  const { projectCode, entityCode } = useParams();

  const getSnakeCase = (measureLevel?: string) => {
    return measureLevel
      ?.split(/\.?(?=[A-Z])/)
      .join('_')
      .toLowerCase();
  };

  return useEntitiesWithLocation(
    projectCode,
    entityCode,
    {
      params: {
        filter: {
          generational_distance: {
            comparator: '<=',
            comparisonValue: 2,
          },
        },
      },
    },
    { enabled: !!measureLevel },
  );
};

export const MarkerLayer = () => {
  // set the map default overlay if there isn't one selected
  useDefaultMapOverlay();

  const navigateToDashboard = useNavigateToDashboard();
  const { projectCode, entityCode } = useParams();
  const { selectedOverlay } = useMapOverlays(projectCode, entityCode);
  const { data: entitiesData } = useEntitiesByMeasureLevel(selectedOverlay?.measureLevel);
  const { data: mapOverlayData } = useMapOverlayReport(projectCode, entityCode, selectedOverlay);
  const { data: entity } = useEntity(entityCode);

  if (!entitiesData || !mapOverlayData || !entity) {
    return null;
  }

  // todo: move to mapOverlays route
  const displayOnLevel = mapOverlayData.serieses.find((series: any) => series.displayOnLevel);
  if (displayOnLevel && camelCase(entity.type!) !== camelCase(displayOnLevel.displayOnLevel)) {
    return null;
  }

  const processedMeasureData = processMeasureData({
    entitiesData,
    measureData: mapOverlayData.measureData,
    serieses: mapOverlayData.serieses,
    hiddenValues: {},
  });

  return (
    <UIMarkerLayer
      measureData={processedMeasureData}
      serieses={mapOverlayData.serieses}
      // @ts-ignore - ui-components types refer to organisation unit instead of entity so there is a mismatch
      onSeeOrgUnitDashboard={navigateToDashboard}
    />
  );
};
