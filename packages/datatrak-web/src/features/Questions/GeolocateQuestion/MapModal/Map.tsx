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

// On small screens the map needs to fit in the body of the modal so that we don't create a scroll trap fo r the user
// but the map container also needs a set height to render correctly so it's not possible to use flexbox to fill the height
// and so we need to set the height manually using this fudge factor.
const PAGE_PADDING = 280;

const MapContainer = styled(BaseMapContainer)`
  height: 30rem;
  width: 100%;
  margin-top: 2.5rem;

  ${({ theme }) => theme.breakpoints.down('sm')} {
    margin-top: 1rem;
    height: calc(100vh - ${PAGE_PADDING}px);
  }
`;

const Pin = new Icon({
  iconUrl: '/mapIcon.png',
  iconSize: [70, 70],
  iconAnchor: [35, 60], // anchor the tip of the pin to the coordinates
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

  // round coordinates to 4 decimal places before setting them - any less and the coordinates are not very accurate
  const onUpdateCoordinates = ({ lat, lng }: LatLngLiteral) => {
    setCoordinates({
      lat: parseFloat(lat.toFixed(4)),
      lng: parseFloat(lng.toFixed(4)),
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
