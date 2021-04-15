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
import { MEASURE_TYPE_RADIUS } from './utils';

const ShadedPolygon = styled(Polygon)`
  weight: 1;
  fill-opacity: 0.5;
  :hover {
    fill-opacity: 0.8;
  }
`;

export const MarkerLayer = ({ measureData, measureOptions }) => {
  if (!measureData || !measureOptions) return null;

  // for radius overlay sort desc radius to place smaller circles over larger circles
  if (measureOptions.some(l => l.type === MEASURE_TYPE_RADIUS)) {
    measureData.sort((a, b) => {
      return Number(b.radius) - Number(a.radius);
    });
  }

  return (
    <LayerGroup>
      {measureData.map(measure =>
        measure.region ? (
          <ShadedPolygon key={measure.code} positions={measure.region} {...measure}>
            <AreaTooltip text={`${measure.name}: ${measure.originalValue}`} />
          </ShadedPolygon>
        ) : (
          <MeasureMarker key={measure.code} {...measure}>
            <MeasurePopup measureData={measure} measureOptions={measureOptions} />
          </MeasureMarker>
        ),
      )}
    </LayerGroup>
  );
};

MarkerLayer.propTypes = {
  measureData: PropTypes.array,
  measureOptions: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ),
};

MarkerLayer.defaultProps = {
  measureData: null,
  measureOptions: null,
};
