/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import {
  LayerGroup,
  BasePolygon,
  AreaTooltip,
  MeasureData,
  BREWER_PALETTE,
  Series,
} from '@tupaia/ui-map-components';

const ShadedPolygon = styled(BasePolygon)`
  fill-opacity: 0.5;
  &:hover {
    fill-opacity: 0.8;
  }
`;

interface PolygonLayerProps {
  measureData: MeasureData[];
  navigateToEntity: (entityCode?: string) => void;
  serieses: Series[];
}

export const PolygonLayer = ({ measureData, navigateToEntity, serieses }: PolygonLayerProps) => {
  const polygonLayers = measureData.filter(m => !!m.region);

  return (
    <LayerGroup>
      {polygonLayers.map((measure: MeasureData) => {
        const { region, organisationUnitCode: entity, color, name } = measure;

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
      })}
    </LayerGroup>
  );
};
