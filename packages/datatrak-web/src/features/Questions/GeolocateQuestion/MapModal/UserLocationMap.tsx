import React, { useEffect } from 'react';
import { LatLngLiteral } from 'leaflet';
import { useMap } from 'react-leaflet';
import { DEFAULT_BOUNDS, TileLayer, DEFAULT_TILESETS } from '@tupaia/ui-map-components';
import { DEFAULT_ZOOM_LEVEL, UNSET_LOCATION_ZOOM_LEVEL } from './constants';

interface UserLocationMapProps {
  lat?: number;
  lng?: number;
  setCoordinates: (coordinates: LatLngLiteral) => void;
  coordinatesInvalid: boolean;
  tileSet: typeof DEFAULT_TILESETS.osm;
}

export const UserLocationMap = ({
  lat,
  lng,
  setCoordinates,
  coordinatesInvalid,
  tileSet,
}: UserLocationMapProps) => {
  const map = useMap();

  useEffect(() => {
    // If the user has not yet dropped a pin, use their current location
    if (coordinatesInvalid) {
      map
        .locate()
        .on('locationfound', e => {
          map.flyTo(e.latlng, DEFAULT_ZOOM_LEVEL);
          setCoordinates(e.latlng);
        })
        .on('locationerror', () => {
          // if there is a problem getting the user's location, use the center of the default bounds. This is in cases where, for example, the user denies location access
          const latLong = {
            lat: DEFAULT_BOUNDS[0][0] + (DEFAULT_BOUNDS[1][0] - DEFAULT_BOUNDS[0][0]) / 2,
            lng: DEFAULT_BOUNDS[0][1] + (DEFAULT_BOUNDS[1][1] - DEFAULT_BOUNDS[0][1]) / 2,
          };
          map.flyTo(latLong, UNSET_LOCATION_ZOOM_LEVEL);
          setCoordinates(latLong);
        });
    } else {
      // Otherwise use the location they have already dropped a pin on/entered manually
      map.setView([lat!, lng!], DEFAULT_ZOOM_LEVEL);
    }
  }, []);

  return <TileLayer tileSetUrl={tileSet.url} />;
};
