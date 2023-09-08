/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Icon } from 'leaflet';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, ZoomControl } from 'react-leaflet';
import { Typography } from '@material-ui/core';
import { OutlinedButton, Button } from '@tupaia/ui-components';
import { coordinateType } from '../../../types';
import { Modal } from '../../../components/Modal';

const GeolocateModal = styled(Modal)`
  height: 40rem;
  max-width: 75rem;
`;

const HeaderWrapper = styled.div`
  width: 75rem;
  height: auto;
  text-align: left;
`;
const ModalHeading = styled(Typography).attrs({
  variant: 'h1',
})`
  color: black;
  font-size: 1.125rem;
  padding-bottom: 0.5rem;
`;

const ModalSubHeading = styled(Typography).attrs({
  variant: 'h2',
})`
  color: #898989;
  font-size: 1rem;
`;

const MapDiv = styled(MapContainer)`
  height: 40rem;
  width: 75rem;
  margin: 5rem 1rem 3rem 1rem;
`;

const ModalButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 75rem;
  height: 2rem;
  text-align: left;
`;

const mapPin = new Icon({
  iconUrl: '/mapIcon.png',
  iconSize: [75, 75],
});

const UserLocationMap = ({
  geolocation,
  setGeolocation,
}: {
  geolocation: coordinateType;
  setGeolocation: any;
}) => {
  const map = useMap();

  useEffect(() => {
    if (geolocation.latitude === null || geolocation.longitude === null) {
      map.locate().on('locationfound', function (e) {
        map.setView(e.latlng, map.getZoom());
        setGeolocation({
          latitude: parseFloat(e.latlng.lat.toFixed(2)),
          longitude: parseFloat(e.latlng.lng.toFixed(2)),
        });
      });
    } else {
      map.setView([geolocation.latitude, geolocation.longitude], map.getZoom());
    }
  }, []);

  return (
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
  );
};

const PinDrop = ({
  geolocation,
  setGeolocation,
}: {
  geolocation: coordinateType;
  setGeolocation: any;
}) => {
  useMapEvents({
    click(e) {
      setGeolocation({
        latitude: parseFloat(e.latlng.lat.toFixed(2)),
        longitude: parseFloat(e.latlng.lng.toFixed(2)),
      });
    },
  });

  if (geolocation.latitude !== null && geolocation.longitude !== null) {
    return <Marker position={[geolocation.latitude, geolocation.longitude]} icon={mapPin} />;
  } else {
    return <Marker position={[0, 0]} icon={mapPin} />;
  }
};
export const MapModal = ({
  onClose,
  geolocation,
  setGeolocation,
  defaultLocation,
}: {
  onClose: () => void;
  geolocation: coordinateType;
  setGeolocation: any;
  defaultLocation: coordinateType;
}) => {
  const onCancel = () => {
    setGeolocation(defaultLocation);
    onClose();
  };
  return (
    <GeolocateModal isOpen onClose={onClose}>
      <HeaderWrapper>
        <ModalHeading>Drop pin on map</ModalHeading>
        <ModalSubHeading>
          Click to drop the pin in a new position on the map and click 'Confirm'
        </ModalSubHeading>
      </HeaderWrapper>
      <MapDiv center={[17.7134, 178.065]} zoom={12} scrollWheelZoom={true} zoomControl={false}>
        <UserLocationMap geolocation={geolocation} setGeolocation={setGeolocation} />
        <PinDrop geolocation={geolocation} setGeolocation={setGeolocation} />
        <ZoomControl position="bottomright" />
      </MapDiv>
      <ModalButtonsWrapper>
        <OutlinedButton onClick={onCancel}>Cancel</OutlinedButton>
        <Button onClick={onClose}>Submit</Button>
      </ModalButtonsWrapper>
    </GeolocateModal>
  );
};
