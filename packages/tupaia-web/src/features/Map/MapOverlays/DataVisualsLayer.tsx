/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import camelCase from 'camelcase';
import {
  LegendProps,
  MeasureMarker,
  LayerGroup,
  MeasurePopup,
  BasePolygon,
  AreaTooltip,
  MeasureData,
  BREWER_PALETTE,
} from '@tupaia/ui-map-components';
import { ErrorBoundary } from '@tupaia/ui-components';
import { useEntity } from '../../../api/queries';
import { useMapOverlayData, useNavigateToEntity } from '../utils';
import { ActiveEntityPolygon } from './ActiveEntityPolygon';
import { gaEvent } from '../../../utils';

const ShadedPolygon = styled(BasePolygon)`
  fill-opacity: 0.5;
  &:hover {
    fill-opacity: 0.8;
  }
`;

export const DataVisualsLayer = ({
  hiddenValues,
}: {
  hiddenValues: LegendProps['hiddenValues'];
}) => {
  const navigateToEntity = useNavigateToEntity();
  const { projectCode, entityCode } = useParams();
  const { data: entity } = useEntity(projectCode, entityCode);
  const { serieses, measureData, activeEntity, selectedOverlay } = useMapOverlayData(hiddenValues);
  useEffect(() => {
    if (selectedOverlay !== undefined) {
      gaEvent('Map Overlays', 'Change', selectedOverlay?.name);
    }
  }, [selectedOverlay?.name]);
  useEffect(() => {
    if (activeEntity !== undefined) {
      gaEvent('Entity', 'Change', activeEntity?.name);
    }
  }, [activeEntity?.name]);

  // Don't show the marker layer if the entity type doesn't match the measure level
  const firstSeries = serieses?.find((series: any) => series.displayOnLevel);
  if (firstSeries && camelCase(entity?.type!) !== camelCase(firstSeries.displayOnLevel)) {
    return null;
  }

  if (!measureData || !serieses) {
    return null;
  }

  return (
    <ErrorBoundary>
      <LayerGroup>
        {measureData.map((measure: MeasureData) => {
          const { region, organisationUnitCode: entity, color, name, code } = measure;
          if (region) {
            // To match with the color in markerIcon.js which uses BREWER_PALETTE
            const shade = BREWER_PALETTE[color as keyof typeof BREWER_PALETTE] || color;

            return (
              <ShadedPolygon
                key={entity}
                positions={region}
                pathOptions={{
                  color: shade,
                  fillColor: shade,
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
    </ErrorBoundary>
  );
};
