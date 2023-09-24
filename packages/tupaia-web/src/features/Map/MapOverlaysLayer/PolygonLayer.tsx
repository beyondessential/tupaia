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
import { useParams } from 'react-router-dom';
import { useMapOverlays } from '../../../api/queries';
import { useNavigateToEntity } from '../utils';

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

export const PolygonLayer = ({ measureData = [], serieses = [] }: PolygonLayerProps) => {
  const { projectCode, entityCode: activeEntityCode } = useParams();
  const navigateToEntity = useNavigateToEntity();
  const { selectedOverlay, isPolygonSerieses } = useMapOverlays(projectCode, activeEntityCode);
  const polygons = measureData.filter(m => !!m.region);

  function getDisplayType(measure) {
    if (
      isPolygonSerieses &&
      selectedOverlay?.measureLevel?.toLowerCase() === measure?.type?.toLowerCase()
    ) {
      // The active entity is part of the data visual so display it as a shaded polygon rather
      // than an active polygon
      return DISPLAY_TYPES.shaded;
    }
    if (measure?.code === activeEntityCode) {
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
        const onClick =
          displayType === DISPLAY_TYPES.active ? undefined : () => navigateToEntity(code);

        return (
          <PolygonComponent
            positions={region}
            $displayType={displayType}
            $shade={shade}
            eventHandlers={{
              click: onClick,
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
