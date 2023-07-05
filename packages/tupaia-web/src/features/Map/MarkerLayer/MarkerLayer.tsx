/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { useParams } from 'react-router';
import { useLocation, useNavigate } from 'react-router-dom';
import { MarkerLayer as UIMarkerLayer } from '@tupaia/ui-map-components';
import {
  useEntitiesWithLocation,
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

const getSnakeCase = measureLevel => {
  return measureLevel
    ?.split(/\.?(?=[A-Z])/)
    .join('_')
    .toLowerCase();
};

export const MarkerLayer = () => {
  // set the map default overlay if there isn't one selected
  useDefaultMapOverlay();

  const navigateToDashboard = useNavigateToDashboard();
  const { projectCode, entityCode } = useParams();
  const { selectedOverlay } = useMapOverlays(projectCode, entityCode);
  const { data: entitiesData } = useEntitiesWithLocation(
    projectCode,
    entityCode,
    {
      params: { filter: { type: getSnakeCase(selectedOverlay?.measureLevel) } },
    },
    { enabled: !!selectedOverlay?.measureLevel },
  );
  const { data: mapOverlayData } = useMapOverlayReport(projectCode, entityCode, selectedOverlay);

  if (!entitiesData || !mapOverlayData) {
    return null;
  }

  const processedMeasureData = processMeasureData({
    entityType: 'country', // Todo: add entity type
    entitiesData,
    measureData: mapOverlayData.measureData,
    serieses: mapOverlayData.serieses,
    hiddenValues: {},
  });

  return (
    <UIMarkerLayer
      measureData={processedMeasureData}
      serieses={mapOverlayData.serieses}
      onSeeOrgUnitDashboard={navigateToDashboard}
    />
  );
};
