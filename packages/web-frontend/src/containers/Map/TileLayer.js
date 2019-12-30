/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { TileLayer as LeafletTileLayer, LayerGroup, AttributionControl } from 'react-leaflet';
import { mapBoxToken } from '../../utils';

// Taken from https://www.mapbox.com/help/how-attribution-works/#other-mapping-frameworks.
const attribution =
  '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>';

const tileLayerUrls = {
  satellite: `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v10/tiles/256/{z}/{x}/{y}?access_token=${mapBoxToken}`,
  osm: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
};

export const TileLayer = ({ tileSet }) => {
  const tileLayerKey = tileSet || 'osm';
  const tileLayerUrl = tileLayerUrls[tileLayerKey] || tileLayerUrls.osm;

  return (
    <LayerGroup>
      <AttributionControl position="bottomleft" prefix="" />
      <LeafletTileLayer url={tileLayerUrl} attribution={attribution} />
    </LayerGroup>
  );
};
