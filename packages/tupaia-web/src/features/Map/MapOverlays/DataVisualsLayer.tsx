/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import camelCase from 'camelcase';
import {
  LegendProps,
  MeasureMarker,
  LayerGroup,
  MeasurePopup,
  Polygon,
  AreaTooltip,
  MeasureData,
} from '@tupaia/ui-map-components';
import { useEntity } from '../../../api/queries';
import { useMapOverlayData, useNavigateToEntity } from '../utils';

const ShadedPolygon = styled(Polygon)`
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
  const { serieses, measureData } = useMapOverlayData(hiddenValues);

  // Don't show the marker layer if the entity type doesn't match the measure level
  const firstSeries = serieses?.find((series: any) => series.displayOnLevel);
  if (firstSeries && camelCase(entity?.type!) !== camelCase(firstSeries.displayOnLevel)) {
    return null;
  }

  if (!measureData || !serieses) {
    return null;
  }

  return (
    <LayerGroup>
      {measureData.map((measure: MeasureData) => {
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
