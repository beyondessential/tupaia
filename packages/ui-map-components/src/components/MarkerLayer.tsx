/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
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
const getTooltipText = ({ name, ...markerData }: GenericDataItem, serieses: Series[]) =>
  `${name}: ${getSingleFormattedValue(markerData, serieses)}`;

// Filter hidden and invalid values and sort measure data
const processData = (measureData: MeasureData[], serieses: Series[]) => {
  const data = measureData
    .filter(({ coordinates, region }) => region || (coordinates && coordinates.length === 2))
    .filter(({ isHidden }) => !isHidden);

  // for radius overlay sort desc radius to place smaller circles over larger circles
  if (serieses.some(l => l.type === MEASURE_TYPE_RADIUS)) {
    data.sort((a, b) => Number(b.radius) - Number(a.radius));
  }

  return data;
};

interface MarkerLayerProps {
  measureData: MeasureData[];
  serieses: Series[];
  multiOverlayMeasureData: GenericDataItem[];
  multiOverlaySerieses: Series[];
  onSeeOrgUnitDashboard: (orgUnitCode: string) => void;
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
      {data.map(({ region, organisationUnitCode, color, ...measure }) => {
        if (measure.region) {
          return (
            <ShadedPolygon
              {...measure}
              key={organisationUnitCode}
              positions={region}
              pathOptions={{
                color,
                fillColor: color,
              }}
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

MarkerLayer.propTypes = {
  measureData: PropTypes.array,
  multiOverlayMeasureData: PropTypes.array,
  serieses: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ),
  multiOverlaySerieses: PropTypes.array,
  onSeeOrgUnitDashboard: PropTypes.func,
};

MarkerLayer.defaultProps = {
  measureData: null,
  multiOverlayMeasureData: null,
  serieses: null,
  multiOverlaySerieses: null,
  onSeeOrgUnitDashboard: null,
};
