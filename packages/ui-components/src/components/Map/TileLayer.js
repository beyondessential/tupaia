/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { TileLayer as LeafletTileLayer, LayerGroup, AttributionControl } from 'react-leaflet';

// Taken from https://www.mapbox.com/help/how-attribution-works/#other-mapping-frameworks.
const attribution =
  '<a href="https://leafletjs.com/">Leaflet</a> © <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>';

export const TileLayer = ({ tileSetUrl }) => {
  const tileLayer = useRef(null);

  useEffect(() => {
    if (tileLayer) {
      tileLayer.current.setUrl(tileSetUrl);
    }
  }, [tileSetUrl]);

  return (
    <LayerGroup>
      <AttributionControl position="bottomleft" prefix="" />
      <LeafletTileLayer url={tileSetUrl} attribution={attribution} ref={tileLayer} />
    </LayerGroup>
  );
};

TileLayer.propTypes = {
  tileSetUrl: PropTypes.string,
};

TileLayer.defaultProps = {
  tileSetUrl: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
};
