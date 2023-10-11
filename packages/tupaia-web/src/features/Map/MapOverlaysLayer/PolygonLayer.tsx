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
  $active?: string;
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
  stroke: ${({ $shade }) => $shade};
  fill-opacity: 0.5;
  &:hover {
    fill-opacity: ${({ $active }) =>
      $active
        ? 0.5
        : 0.8}; // don't add hover effect when it is the active polygon because it isn't clickable
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

  const overlayLevels = Array.isArray(selectedOverlay?.measureLevel)
    ? selectedOverlay?.measureLevel
    : [selectedOverlay?.measureLevel].map(level => level?.toLowerCase());

  function getDisplayType(measure) {
    const isActive = measure.code === activeEntityCode;
    if (measure.isHidden) {
      // when the measure is hidden, the entity polygon is still visible, but it doesn't have a shade applied. When it is active it should be the active polygon, otherwise it should be a basic polygon
      return isActive ? DISPLAY_TYPES.active : DISPLAY_TYPES.basic;
    }
    if (
      isPolygonSerieses &&
      overlayLevels.includes(measure?.type?.toLowerCase().replace('_', '')) // handle differences between camelCase and snake_case
    ) {
      // The active entity is part of the data visual so display it as a shaded polygon rather
      // than an active polygon
      return DISPLAY_TYPES.shaded;
    }
    if (isActive) {
      return DISPLAY_TYPES.active;
    }

    // only show shaded polygons if there is a measure value, i.e. it is not a navigation polygon (like a sibling etc)
    if (isPolygonSerieses && measure?.value !== undefined) {
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
        const showDataOnTooltip = displayType === DISPLAY_TYPES.shaded;
        const onClick =
          displayType === DISPLAY_TYPES.active ? undefined : () => navigateToEntity(code);

        function getDisplayKey() {
          // Use a random key to ensure that the active polygon is re-rendered to be on top
          if (displayType === DISPLAY_TYPES.active) {
            return `currentEntityPolygon${Math.random()}`;
          }
          const { code: entityCode } = measure;
          // Ensure that the polygon is re-rendered when the display variables change
          return `${entityCode}-${shade}`;
        }

        return (
          <PolygonComponent
            positions={region}
            $shade={shade}
            $active={code === activeEntityCode}
            eventHandlers={{
              click: onClick,
            }}
            key={getDisplayKey()}
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
