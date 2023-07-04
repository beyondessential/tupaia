/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { useParams } from 'react-router';
import camelCase from 'camelcase';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  calculateRadiusScaleFactor,
  getMeasureDisplayInfo,
  MarkerLayer as UIMarkerLayer,
} from '@tupaia/ui-map-components';
import {
  useEntitiesWithLocation,
  useMapOverlayReport,
  useMapOverlays,
  useProject,
} from '../../api/queries';
import { EntityCode } from '../../types';

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

const processMeasureData = ({ entityType, measureData, entitiesData, serieses, hiddenValues }) => {
  const displayOnLevel = serieses.find(series => series.displayOnLevel);
  if (displayOnLevel && camelCase(entityType) !== camelCase(displayOnLevel.displayOnLevel)) {
    return null;
  }

  const radiusScaleFactor = calculateRadiusScaleFactor(measureData);

  return entitiesData.map(entity => {
    const measure = measureData.find(e => e.organisationUnitCode === entity.code);
    const { color, icon, originalValue, isHidden, radius } = getMeasureDisplayInfo(
      measure,
      serieses,
      hiddenValues,
      radiusScaleFactor,
    );

    return {
      ...entity,
      ...measure,
      isHidden,
      radius,
      organisationUnitCode: entity.code,
      coordinates: entity.point,
      region: entity.region,
      color,
      icon,
      originalValue,
    };
  });
};

export const MarkerLayer = () => {
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
