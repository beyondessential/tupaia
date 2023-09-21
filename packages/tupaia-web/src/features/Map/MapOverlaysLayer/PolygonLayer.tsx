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
  Series,
  MAP_COLORS,
  BREWER_PALETTE,
} from '@tupaia/ui-map-components';
import { Polygon } from 'react-leaflet';

const { POLYGON_BLUE, POLYGON_HIGHLIGHT } = MAP_COLORS;

interface PolygonProps {
  $displayType?: string;
  $shade?: string;
}

const ActivePolygon = styled(Polygon)<PolygonProps>`
  stroke: ${POLYGON_HIGHLIGHT};
  fill-opacity: 0;
  fill: none;
  pointer-events: none;
  stroke-width: 3px;
`;

const ShadedPolygon = styled(BasePolygon)<PolygonProps>`
  fill: ${({ $shade }) => $shade};
  fill-opacity: 0.5;
  &:hover {
    fill-opacity: 0.8;
  }
`;

const BasicPolygon = styled(BasePolygon)<PolygonProps>`
  fill: ${POLYGON_BLUE};
  stroke: ${POLYGON_BLUE};
  fill-opacity: 0.04;
  stroke-width: 1;
  &:hover {
    fill-opacity: 0.5;
    stroke: ${POLYGON_HIGHLIGHT};
    fill: ${POLYGON_HIGHLIGHT};
  }
`;

const TransparentShadedPolygon = styled(BasePolygon)<PolygonProps>`
  fill: ${POLYGON_BLUE};
  fill-opacity: 0;
  &:hover {
    fill-opacity: 0.1;
  }
`;

interface PolygonLayerProps {
  measureData: MeasureData[];
  navigateToEntity: (entityCode?: string) => void;
  serieses: Series[];
}

const POLYGON_COMPONENTS = {
  basicPolygon: BasicPolygon,
  shadedPolygon: ShadedPolygon,
  transparentShadedPolygon: TransparentShadedPolygon,
  activePolygon: ActivePolygon,
};

export const PolygonLayer = ({
  measureData = [],
  navigateToEntity,
  serieses = [],
}: PolygonLayerProps) => {
  const polygons = measureData.filter(m => !!m.region);
  return (
    <LayerGroup>
      {polygons.map((measure: MeasureData) => {
        const {
          region,
          organisationUnitCode: entity,
          color,
          name,
          polygonDisplayType = 'basicPolygon',
        } = measure;
        const shade = BREWER_PALETTE[color as keyof typeof BREWER_PALETTE] || color;
        const PolygonComponent = POLYGON_COMPONENTS[polygonDisplayType];

        return (
          <PolygonComponent
            positions={region}
            $displayType={polygonDisplayType}
            $shade={shade}
            eventHandlers={{
              click: () => {
                navigateToEntity(entity);
              },
            }}
            key={
              polygonDisplayType === 'activePolygon'
                ? `currentEntityPolygon${Math.random()}`
                : entity
            }
            {...measure}
          >
            <AreaTooltip
              serieses={serieses}
              orgUnitMeasureData={measure as MeasureData}
              orgUnitName={name}
              hasMeasureValue
            />
          </PolygonComponent>
        );
      })}
    </LayerGroup>
  );
};
