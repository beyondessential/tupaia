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
  weight: 1;
  fill-opacity: 0.5;
  :hover {
    fill-opacity: 0.8;
  }
`;

const getText = (measure, measureSeries) => {
  const { name } = measure;
  const hasMeasureValue = measure || measure === 0;

  const text = hasMeasureValue
    ? `${name}: ${getSingleFormattedValue(measure, measureSeries)}`
    : name;

  return text;
};

export const MarkerLayer = ({ measureData, measureSeries }) => {
  if (!measureData || !measureSeries) return null;

  // for radius overlay sort desc radius to place smaller circles over larger circles
  if (measureSeries.some(l => l.type === MEASURE_TYPE_RADIUS)) {
    measureData.sort((a, b) => {
      return Number(b.radius) - Number(a.radius);
    });
  }

  return (
    <LayerGroup>
      {measureData.map(measure =>
        measure.region ? (
          <ShadedPolygon key={measure.code} positions={measure.region} {...measure}>
            <AreaTooltip text={getText(measure, measureSeries)} />
          </ShadedPolygon>
        ) : (
          <MeasureMarker key={measure.code} {...measure}>
            <MeasurePopup measureData={measure} measureSeries={measureSeries} />
          </MeasureMarker>
        ),
      )}
    </LayerGroup>
  );
};

MarkerLayer.propTypes = {
  measureData: PropTypes.array,
  measureSeries: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ),
};

MarkerLayer.defaultProps = {
  measureData: null,
  measureSeries: null,
};
