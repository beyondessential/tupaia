/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { useParams } from 'react-router';
import camelCase from 'camelcase';
import { useLocation, useNavigate } from 'react-router-dom';
import { LegendProps, MarkerLayer as UIMarkerLayer, MeasureData } from '@tupaia/ui-map-components';
import {
  useEntitiesWithLocation,
  useEntity,
  useMapOverlays,
  useProject,
} from '../../../api/queries';
import { useMapOverlayReport } from '../utils';
import { EntityCode } from '../../../types';
import { processMeasureData } from './processMeasureData';

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

const useNavigateToEntity = () => {
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
        includeRoot: false,
        filter: {
          type: getSnakeCase(measureLevel),
        },
      },
    },
    { enabled: !!measureLevel },
  );
};

export const MarkerLayer = ({ hiddenValues }: { hiddenValues: LegendProps['hiddenValues'] }) => {
  const navigateToDashboard = useNavigateToDashboard();
  const navigateToEntity = useNavigateToEntity();
  const { projectCode, entityCode } = useParams();
  const { selectedOverlay } = useMapOverlays(projectCode, entityCode);
  const { data: entitiesData } = useEntitiesByMeasureLevel(selectedOverlay?.measureLevel);
  const { data: mapOverlayData } = useMapOverlayReport();
  const { data: entity } = useEntity(entityCode);

  if (!entitiesData || !mapOverlayData || !entity) {
    return null;
  }

  // Don't show the marker layer if the entity type doesn't match the measure level
  const firstSeries = mapOverlayData.serieses.find((series: any) => series.displayOnLevel);
  if (firstSeries && camelCase(entity.type!) !== camelCase(firstSeries.displayOnLevel)) {
    return null;
  }

  const processedMeasureData = processMeasureData({
    entitiesData,
    measureData: mapOverlayData.measureData,
    serieses: mapOverlayData.serieses,
    hiddenValues,
  });

  console.log('processedMeasureData', processedMeasureData);
  console.log('mapOverlayData.serieses', mapOverlayData.serieses);

  return (
    <UIMarkerLayer
      measureData={processedMeasureData as MeasureData[]}
      serieses={mapOverlayData.serieses}
      // @ts-ignore - ui-components types refer to organisation unit instead of entity so there is a mismatch
      onSeeOrgUnitDashboard={navigateToDashboard}
      onClickEntity={navigateToEntity}
    />
  );
};
