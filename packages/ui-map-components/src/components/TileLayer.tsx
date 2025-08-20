import React, { useRef, useEffect } from 'react';
import { TileLayer as LeafletTileLayer } from 'leaflet';
import { TileLayer as ReactLeafletTileLayer, LayerGroup, AttributionControl } from 'react-leaflet';

// Taken from https://www.mapbox.com/help/how-attribution-works/#other-mapping-frameworks.
const attribution =
  '<a href="https://leafletjs.com/">Leaflet</a> © <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>';

interface TileLayerProps {
  showAttribution?: boolean;
  tileSetUrl?: string;
}

export const TileLayer = ({
  tileSetUrl = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
  showAttribution = true,
}: TileLayerProps) => {
  const tileLayer = useRef<LeafletTileLayer | null>(null);

  useEffect(() => {
    tileLayer?.current?.setUrl(tileSetUrl);
  }, [tileSetUrl]);

  return (
    <LayerGroup>
      <AttributionControl position="bottomleft" prefix="" />
      <ReactLeafletTileLayer
        crossOrigin=""
        url={tileSetUrl}
        attribution={showAttribution ? attribution : ''}
        ref={tileLayer}
      />
    </LayerGroup>
  );
};
