/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import { LayerGroup, Polygon } from 'react-leaflet';
import { MeasureMarker, MeasurePopup } from './Markers';
import { AreaTooltip } from './AreaTooltip';
import { getSingleFormattedValue, MEASURE_TYPE_RADIUS } from '../utils';
import { GenericDataItem, MeasureData, Series } from '../types';

const ShadedPolygon = styled(Polygon)`
  fill-opacity: 0.5;
  :hover {
    fill-opacity: 0.8;
  }
`;

// remove name from the measure data as it's not expected in getSingleFormattedValue
const getTooltipText = (markerData: MeasureData, serieses: Series[]) =>
  `${markerData.name}: ${getSingleFormattedValue(markerData, serieses)}`;

// Filter hidden and invalid values and sort measure data
const processData = (measureData: MeasureData[], serieses: Series[]): MeasureData[] => {
  const data = measureData
    .filter(
      ({ coordinates, region }) =>
        region || (coordinates && (coordinates as number[])?.length === 2),
    )
    .filter(({ isHidden }) => !isHidden);

  // for radius overlay sort desc radius to place smaller circles over larger circles
  if (serieses.some(l => l.type === MEASURE_TYPE_RADIUS)) {
    data.sort((a, b) => Number(b.radius) - Number(a.radius));
  }

  return data;
};

interface MarkerLayerProps {
  measureData?: MeasureData[];
  serieses?: Series[];
  multiOverlayMeasureData?: GenericDataItem[];
  multiOverlaySerieses?: Series[];
  onSeeOrgUnitDashboard?: (organisationUnitCode?: string) => void;
}

export const MarkerLayer = ({
  measureData,
  serieses,
  multiOverlayMeasureData,
  multiOverlaySerieses,
  onSeeOrgUnitDashboard,
}: MarkerLayerProps) => {
  if (!measureData || !serieses) return null;

  const data = processData(measureData, serieses);

  return (
    <LayerGroup>
      {data.map((measure: MeasureData) => {
        if (measure.region) {
          return (
            <ShadedPolygon
              key={measure.organisationUnitCode}
              positions={measure.region!}
              pathOptions={{
                color: measure.color,
                fillColor: measure.color,
              }}
              {...measure}
            >
              <AreaTooltip text={getTooltipText(measure, serieses)} />
            </ShadedPolygon>
          );
        }
        // Need to show all values on tooltips even though we toggle off one map overlay
        const markerData = {
          ...measure,
          ...(multiOverlayMeasureData &&
            multiOverlayMeasureData.find(
              ({ organisationUnitCode }) => organisationUnitCode === measure.organisationUnitCode,
            )),
        };
        return (
          <MeasureMarker key={measure.organisationUnitCode} {...measure}>
            <MeasurePopup
              markerData={markerData}
              serieses={serieses}
              onSeeOrgUnitDashboard={onSeeOrgUnitDashboard}
              multiOverlaySerieses={multiOverlaySerieses}
            />
          </MeasureMarker>
        );
      })}
    </LayerGroup>
  );
};
