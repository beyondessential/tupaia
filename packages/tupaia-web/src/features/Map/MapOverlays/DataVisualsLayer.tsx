/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { useParams } from 'react-router';
import camelCase from 'camelcase';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LegendProps,
  MeasureMarker,
  LayerGroup,
  MeasurePopup,
  Polygon,
  AreaTooltip,
  MeasureData,
} from '@tupaia/ui-map-components';
import {
  useEntitiesWithLocation,
  useEntity,
  useMapOverlays,
  useProject,
} from '../../../api/queries';
import { useMapOverlayReport } from '../utils';
import { EntityCode } from '../../../types';
import { processMeasureData } from './processMeasureData';
import styled from 'styled-components';

const ShadedPolygon = styled(Polygon)`
  fill-opacity: 0.5;
  :hover {
    fill-opacity: 0.8;
  }
`;

const useNavigateToEntity = () => {
  const { projectCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: project } = useProject(projectCode);

  return (entityCode?: EntityCode) => {
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

export const DataVisualsLayer = ({
  hiddenValues,
}: {
  hiddenValues: LegendProps['hiddenValues'];
}) => {
  const navigateToEntity = useNavigateToEntity();
  const { projectCode, entityCode } = useParams();
  const { selectedOverlay } = useMapOverlays(projectCode, entityCode);
  const { data: entitiesData } = useEntitiesByMeasureLevel(selectedOverlay?.measureLevel);
  const { data: mapOverlayData } = useMapOverlayReport();
  const { data: entity } = useEntity(projectCode, entityCode);

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

  if (!processedMeasureData || !mapOverlayData.serieses) {
    return null;
  }

  const serieses = mapOverlayData.serieses;

  return (
    <LayerGroup>
      {processedMeasureData.map(measure => {
        if (measure.region) {
          return (
            <ShadedPolygon
              key={measure.organisationUnitCode}
              positions={measure.region}
              pathOptions={{
                color: measure.color,
                fillColor: measure.color,
              }}
              eventHandlers={{
                click: () => {
                  navigateToEntity(measure.organisationUnitCode);
                },
              }}
              {...measure}
            >
              <AreaTooltip
                serieses={serieses}
                orgUnitMeasureData={measure as MeasureData}
                orgUnitName={measure.name}
                hasMeasureValue
              />
            </ShadedPolygon>
          );
        }

        return (
          <MeasureMarker key={measure.organisationUnitCode} {...(measure as MeasureData)}>
            <MeasurePopup
              markerData={measure as MeasureData}
              serieses={serieses}
              onSeeOrgUnitDashboard={navigateToEntity}
            />
          </MeasureMarker>
        );
      })}
    </LayerGroup>
  );
};
