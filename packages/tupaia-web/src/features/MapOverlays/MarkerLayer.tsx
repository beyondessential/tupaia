/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import camelCase from 'camelcase';
import { useParams } from 'react-router';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  autoAssignColors,
  calculateRadiusScaleFactor,
  createValueMapping,
  getMeasureDisplayInfo,
  getSpectrumScaleValues,
  MarkerLayer as UIMarkerLayer,
  SPECTRUM_MEASURE_TYPES,
} from '@tupaia/ui-map-components';
import {
  useEntitiesWithLocation,
  useMapOverlayReport,
  useMapOverlays,
  useProject,
} from '../../api/queries';
import { EntityCode } from '../../types';

const getMeasureDataFromResponse = (overlay, measureDataResponse) => {
  // Legacy overlays have the config returned in the data response, return directly
  if (!overlay || overlay.legacy === true) {
    return measureDataResponse;
  }

  const { measureCode, measureLevel, displayType, dataElementCode, ...restOfOverlay } = overlay;

  const measureOptions = [
    {
      measureLevel,
      type: displayType,
      key: dataElementCode || 'value',
      ...restOfOverlay,
    },
  ];

  return {
    measureCode,
    measureLevel,
    measureOptions,
    serieses: measureOptions,
    measureData: measureDataResponse,
  };
};

const processSerieses = (serieses, measureData) =>
  serieses.map(series => {
    const { values: mapOptionValues, type } = series;
    const values = autoAssignColors(mapOptionValues);
    const valueMapping = createValueMapping(values, type);

    if (SPECTRUM_MEASURE_TYPES.includes(type)) {
      // for each spectrum, include the minimum and maximum values for
      // use in the legend scale labels.
      const { min, max } = getSpectrumScaleValues(measureData, series);
      const noDataColour = '#c7c7c7';

      return {
        ...series,
        values,
        valueMapping,
        min,
        max,
        noDataColour,
      };
    }

    // If it is not a radius series and there is no icon set a default
    if (series.type !== 'radius' && !series.icon) {
      return {
        ...series,
        values,
        valueMapping,
      };
    }

    return {
      ...series,
      values,
      valueMapping,
    };
  });

const processMeasureData = ({
  entityType,
  measureData,
  entitiesData,
  serieses,
  hiddenValues,
  measureLevel,
}) => {
  const displayOnLevel = serieses.find(series => series.displayOnLevel);
  if (displayOnLevel && camelCase(entityType) !== camelCase(displayOnLevel.displayOnLevel)) {
    return [];
  }

  const radiusScaleFactor = calculateRadiusScaleFactor(measureData);

  return entitiesData
    .filter(entity => camelCase(entity.type) === camelCase(measureLevel))
    .map(entity => {
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

const useMarkerData = () => {
  const { projectCode, entityCode } = useParams();
  const { data: entitiesData = [] } = useEntitiesWithLocation(projectCode, entityCode);
  const { selectedOverlayCode, selectedOverlay } = useMapOverlays(projectCode, entityCode);
  const { data: mapOverlayData } = useMapOverlayReport(
    projectCode,
    entityCode,
    selectedOverlayCode,
    selectedOverlay?.legacy,
  );

  if (!entitiesData || !selectedOverlay || !mapOverlayData) {
    return { isLoading: true };
  }

  const measureData = mapOverlayData
    ? getMeasureDataFromResponse(selectedOverlay, mapOverlayData)
    : null;

  const processedSerieses = measureData
    ? processSerieses(measureData.serieses, measureData.measureData)
    : null;

  const processedMeasureData =
    measureData && entitiesData
      ? processMeasureData({
          entityType: 'country', // Todo: add entity type
          measureLevel: measureData.measureLevel,
          measureData: measureData.measureData,
          entitiesData,
          serieses: processedSerieses,
          hiddenValues: {},
        })
      : null;

  return {
    serieses: processedSerieses,
    measureData: processedMeasureData,
    selectedOverlay,
    isLoading: !processedMeasureData,
  };
};

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

export const MarkerLayer = () => {
  const { measureData, serieses, isLoading } = useMarkerData();
  const navigateToDashboard = useNavigateToDashboard();

  if (isLoading) {
    return null;
  }

  return (
    <UIMarkerLayer
      measureData={measureData}
      serieses={serieses}
      onSeeOrgUnitDashboard={navigateToDashboard}
    />
  );
};
