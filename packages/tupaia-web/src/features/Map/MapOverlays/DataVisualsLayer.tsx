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
    <>
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
    </>
  );
};
