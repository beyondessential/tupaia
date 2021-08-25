/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { LayerGroup, Polygon } from 'react-leaflet';
import { MeasureMarker, MeasurePopup } from './Markers';
import { AreaTooltip } from './AreaTooltip';
import { getSingleFormattedValue, MEASURE_TYPE_RADIUS } from './utils';

const ShadedPolygon = styled(Polygon)`
  fill-opacity: 0.5;
  :hover {
    fill-opacity: 0.8;
  }
`;

// remove name from the measure data as it's not expected in getSingleFormattedValue
const getTooltipText = ({ name, ...markerData }, serieses) =>
  `${name}: ${getSingleFormattedValue(markerData, serieses)}`;

// Filter hidden and invalid values and sort measure data
const processData = (measureData, serieses) => {
  const data = measureData
    .filter(({ coordinates, region }) => region || (coordinates && coordinates.length === 2))
    .filter(({ isHidden }) => !isHidden);

  // for radius overlay sort desc radius to place smaller circles over larger circles
  if (serieses.some(l => l.type === MEASURE_TYPE_RADIUS)) {
    data.sort((a, b) => Number(b.radius) - Number(a.radius));
  }

  return data;
};

export const MarkerLayer = ({ measureData, serieses }) => {
  if (!measureData || !serieses) return null;

  const data = processData(measureData, serieses);

  return (
    <LayerGroup>
      {data.map((measure, index) =>
        measure.region ? (
          // eslint-disable-next-line react/no-array-index-key
          <ShadedPolygon key={index} positions={measure.region} {...measure}>
            <AreaTooltip text={getTooltipText(measure, serieses)} />
          </ShadedPolygon>
        ) : (
          // eslint-disable-next-line react/no-array-index-key
          <MeasureMarker key={index} {...measure}>
            <MeasurePopup markerData={measure} serieses={serieses} />
          </MeasureMarker>
        ),
      )}
    </LayerGroup>
  );
};

MarkerLayer.propTypes = {
  measureData: PropTypes.array,
  serieses: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ),
};

MarkerLayer.defaultProps = {
  measureData: null,
  serieses: null,
};
