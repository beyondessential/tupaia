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
  POLYGON_MEASURE_TYPES,
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
  // we need to only display the serieses where type is included in POLYGON_MEASURE_TYPES, otherwise some entities which have both region and point coordinates will be displayed twice
  const polygonSerieses = serieses.filter(s => POLYGON_MEASURE_TYPES.includes(s.type));
  if (!polygonSerieses.length) return null;
  const polygons = measureData.filter(m => !!m.region);

  return (
    <LayerGroup>
      {polygons.map((measure: MeasureData) => {
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
              serieses={polygonSerieses}
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
