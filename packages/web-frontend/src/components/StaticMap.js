/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import polyline from '@mapbox/polyline';

import { MAPBOX_TOKEN } from '../constants';
import { areBoundsValid } from '../utils/geometry';

const mapboxBaseUrl = 'https://api.mapbox.com/styles/v1/sussol/cj64gthqq297z2so13qljil5n/static';

const getLatLongForBounds = bounds => {
  const lats = bounds.map(latLong => latLong[0]);
  const longs = bounds.map(latLong => latLong[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLong = Math.min(...longs);
  const maxLong = Math.max(...longs);

  const latitude = minLat + (maxLat - minLat) / 2;

  let longitude = minLong + (maxLong - minLong) / 2;

  // Mapbox static api throws errors with anything over 180.
  longitude = longitude > 180 ? 180 : longitude;

  return { latitude, longitude };
};

const StaticMap = ({
  polygonBounds,
  alt,
  width,
  height,
  style,
  zoom,
  zoomOutWhenPast180,
  showAttribution,
  showBox,
}) => {
  if (!areBoundsValid(polygonBounds)) return null;

  const polygonPoints = [
    [polygonBounds[1][0], polygonBounds[1][1]],
    [polygonBounds[1][0], polygonBounds[0][1]],
    [polygonBounds[0][0], polygonBounds[0][1]],
    [polygonBounds[0][0], polygonBounds[1][1]],
    [polygonBounds[1][0], polygonBounds[1][1]],
  ];

  const encodedPolyline = encodeURIComponent(polyline.encode(polygonPoints));

  const polygonParams = showBox ? `/path-5+ed6338-1(${encodedPolyline})` : '';
  const size = `${width}x${height}`;

  // Cannot use auto center and bounds for mapbox as it doesn't work over 160 degrees.
  const { latitude, longitude } = getLatLongForBounds(polygonPoints);

  const zoomLevel = longitude === 180 && zoomOutWhenPast180 ? zoom - 1 : zoom;
  const position = `${longitude},${latitude},${zoomLevel}`;

  const url = `${mapboxBaseUrl}${polygonParams}/${position}/${size}?access_token=${MAPBOX_TOKEN}&attribution=${
    showAttribution ? 'true' : 'false'
  }`;

  return <img src={url} alt={alt} width={width} height={height} style={style} />;
};

StaticMap.propTypes = {
  polygonBounds: PropTypes.array,
  alt: PropTypes.string,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  style: PropTypes.object,
  zoom: PropTypes.number,
  zoomOutWhenPast180: PropTypes.bool,
  showAttribution: PropTypes.bool,
  showBox: PropTypes.bool,
};

StaticMap.defaultProps = {
  polygonBounds: [],
  alt: '',
  style: {},
  zoom: 2,
  zoomOutWhenPast180: true,
  showAttribution: true,
  showBox: true,
};

export default StaticMap;
