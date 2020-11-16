/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { TileLayer as LeafletTileLayer, LayerGroup, AttributionControl } from 'react-leaflet';

// Taken from https://www.mapbox.com/help/how-attribution-works/#other-mapping-frameworks.
const attribution =
  '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>';

export const TileLayer = ({ tileSetUrl }) => (
  <LayerGroup>
    <AttributionControl position="bottomleft" prefix="" />
    <LeafletTileLayer url={tileSetUrl} attribution={attribution} />
  </LayerGroup>
);

TileLayer.propTypes = {
  tileSetUrl: PropTypes.string.isRequired,
};
