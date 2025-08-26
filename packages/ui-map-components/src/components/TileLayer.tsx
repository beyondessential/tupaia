import React, { useRef, useEffect } from 'react';
import { TileLayer as LeafletTileLayer } from 'leaflet';
import { TileLayer as ReactLeafletTileLayer, LayerGroup, AttributionControl } from 'react-leaflet';

interface TileLayerProps {
  tileSetUrl?: string;
}

export const TileLayer = ({
  tileSetUrl = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
}: TileLayerProps) => {
  const tileLayer = useRef<LeafletTileLayer | null>(null);

  useEffect(() => {
    tileLayer?.current?.setUrl(tileSetUrl);
  }, [tileSetUrl]);

  return (
    <LayerGroup>
      <AttributionControl position="bottomleft" prefix="" />
      <ReactLeafletTileLayer crossOrigin="" url={tileSetUrl} ref={tileLayer} />
    </LayerGroup>
  );
};
