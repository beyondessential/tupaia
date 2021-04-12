/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { LayerGroup } from 'react-leaflet';
import { MeasureMarker, MeasurePopup } from './Markers';
import { MEASURE_TYPE_RADIUS } from './utils';

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
      {measureData
        .filter(m => m?.coordinates.length === 2)
        .map(measure => (
          <MeasureMarker
            key={measure.organisationUnitCode}
            radiusScaleFactor={1}
            displayPolygons
            {...measure}
          >
            <MeasurePopup measureData={measure} measureOptions={measureOptions} />
          </MeasureMarker>
        ))}
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
