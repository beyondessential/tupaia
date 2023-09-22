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
  POLYGON_MEASURE_TYPES,
} from '@tupaia/ui-map-components';
import { Polygon } from 'react-leaflet';
import { useParams } from 'react-router-dom';

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

const DISPLAY_TYPES = {
  shaded: 'shadedPolygon',
  transparentShaded: 'transparentShadedPolygon',
  basic: 'basicPolygon',
  active: 'activePolygon',
};

export const PolygonLayer = ({
  measureData = [],
  navigateToEntity,
  serieses = [],
}: PolygonLayerProps) => {
  const { entityCode: activeEntityCode } = useParams();

  const polygons = measureData.filter(m => !!m.region);
  const isPolygonSerieses = serieses.some(s => POLYGON_MEASURE_TYPES.includes(s.type));

  function getDisplayType(measure) {
    if (measure?.code === activeEntityCode && !isPolygonSerieses) {
      return DISPLAY_TYPES.active;
    }
    if (measure.isHidden) {
      return DISPLAY_TYPES.basic;
    }
    if (isPolygonSerieses) {
      return DISPLAY_TYPES.shaded;
    }

    return DISPLAY_TYPES.basic;
  }

  return (
    <LayerGroup>
      {polygons.map((measure: MeasureData) => {
        const { region, code, color, name, permanentTooltip = false } = measure;
        const shade = BREWER_PALETTE[color as keyof typeof BREWER_PALETTE] || color;
        const displayType = getDisplayType(measure);
        const PolygonComponent = POLYGON_COMPONENTS[displayType];
        const key =
          displayType === DISPLAY_TYPES.active ? `currentEntityPolygon${Math.random()}` : code;
        const showDataOnTooltip = displayType === DISPLAY_TYPES.shaded;

        return (
          <PolygonComponent
            positions={region}
            $displayType={displayType}
            $shade={shade}
            eventHandlers={{
              click: () => {
                navigateToEntity(code);
              },
            }}
            key={key}
            {...measure}
          >
            <AreaTooltip
              serieses={serieses}
              orgUnitMeasureData={measure as MeasureData}
              orgUnitName={name}
              hasMeasureValue={showDataOnTooltip}
              permanent={permanentTooltip}
            />
          </PolygonComponent>
        );
      })}
    </LayerGroup>
  );
};
