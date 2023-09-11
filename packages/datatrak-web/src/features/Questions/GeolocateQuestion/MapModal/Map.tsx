/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Icon, LatLngBoundsLiteral, LatLngLiteral } from 'leaflet';
import {
  MapContainer as BaseMapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
  ZoomControl,
} from 'react-leaflet';

const MapContainer = styled(BaseMapContainer)`
  height: 30rem;
  width: 100%;
  margin-top: 2.5rem;
`;

const Pin = new Icon({
  iconUrl: '/mapIcon.png',
  iconSize: [70, 70],
});

type MapComponentProps = {
  lat?: number;
  lng?: number;
  setCoordinates: (coordinates: LatLngLiteral) => void;
};

const DEFAULT_ZOOM_LEVEL = 12;
const UNSET_LOCATION_ZOOM_LEVEL = 3;
// These match the default bounds in `ui-map-components` but we don't import this package in this app, so we have to duplicate them here
const DEFAULT_BOUNDS = [
  [6.5001, 110],
  [-40, 204.5],
] as LatLngBoundsLiteral;

const UserLocationMap = ({
  lat,
  lng,
  setCoordinates,
  coordinatesInvalid,
}: MapComponentProps & {
  coordinatesInvalid: boolean;
}) => {
  const map = useMap();

  useEffect(() => {
    // If the user has not yet dropped a pin, use their current location
    if (coordinatesInvalid) {
      map.locate().on('locationfound', e => {
        map.flyTo(e.latlng, DEFAULT_ZOOM_LEVEL);
        setCoordinates(e.latlng);
      });
    } else {
      // Otherwise use the location they have already dropped a pin on/entered manually
      map.setView([lat!, lng!], DEFAULT_ZOOM_LEVEL);
    }
  }, []);

  return (
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
  );
};

const PinDrop = ({ lat, lng, setCoordinates }: MapComponentProps) => {
  useMapEvents({
    click(e) {
      setCoordinates(e.latlng);
    },
  });

  return <Marker position={[lat!, lng!]} icon={Pin} />;
};

export const Map = ({ lat, lng, setCoordinates }: MapComponentProps) => {
  const coordinatesInvalid = [lat, lng].some(coordinate => !coordinate && coordinate !== 0);

  // round coordinates to 2 decimal places before setting them
  const onUpdateCoordinates = ({ lat, lng }: LatLngLiteral) => {
    setCoordinates({
      lat: parseFloat(lat.toFixed(2)),
      lng: parseFloat(lng.toFixed(2)),
    });
  };
  return (
    <MapContainer
      bounds={DEFAULT_BOUNDS}
      zoom={coordinatesInvalid ? UNSET_LOCATION_ZOOM_LEVEL : DEFAULT_ZOOM_LEVEL}
      scrollWheelZoom={true}
      zoomControl={false}
    >
      <UserLocationMap
        lat={lat}
        lng={lng}
        setCoordinates={onUpdateCoordinates}
        coordinatesInvalid={coordinatesInvalid}
      />
      {!coordinatesInvalid && <PinDrop lat={lat} lng={lng} setCoordinates={onUpdateCoordinates} />}
      <ZoomControl position="bottomright" />
    </MapContainer>
  );
};
