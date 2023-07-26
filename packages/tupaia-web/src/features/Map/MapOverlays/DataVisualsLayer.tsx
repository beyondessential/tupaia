/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import {
  LegendProps,
  MeasureMarker,
  LayerGroup,
  MeasurePopup,
  Polygon,
  AreaTooltip,
  MeasureData,
} from '@tupaia/ui-map-components';
import { useActiveMapOverlayReport, useNavigateToEntity } from '../utils';
import { processMeasureData } from './processMeasureData';

const ShadedPolygon = styled(Polygon)`
  fill-opacity: 0.5;
  :hover {
    fill-opacity: 0.8;
  }
`;

export const DataVisualsLayer = ({
  hiddenValues,
}: {
  hiddenValues: LegendProps['hiddenValues'];
}) => {
  const navigateToEntity = useNavigateToEntity();
  const { serieses, measureData, entities } = useActiveMapOverlayReport();

  if (!measureData || !serieses || !entities) {
    return null;
  }

  const processedMeasureData = processMeasureData({
    entitiesData: entities!,
    measureData,
    serieses,
    hiddenValues,
  });

  if (!processedMeasureData) {
    return null;
  }

  return (
    <LayerGroup>
      {processedMeasureData.map(measure => {
        const { region, organisationUnitCode: entity, color, name } = measure;
        if (region) {
          return (
            <ShadedPolygon
              key={entity}
              positions={region}
              pathOptions={{
                color: color,
                fillColor: color,
              }}
              eventHandlers={{
                click: () => {
                  navigateToEntity(entity);
                },
              }}
              {...measure}
            >
              <AreaTooltip
                serieses={serieses}
                orgUnitMeasureData={measure as MeasureData}
                orgUnitName={name}
                hasMeasureValue
              />
            </ShadedPolygon>
          );
        }

        return (
          <MeasureMarker key={entity} {...(measure as MeasureData)}>
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
