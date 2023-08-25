/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import {
  MapContainer,
  TileLayer,
  Popup,
  Marker,
  useMapEvents,
  useMap,
  ZoomControl,
} from 'react-leaflet';
import { Modal } from '../Modal';
import { latLng } from 'leaflet';

const GeolocateModal = styled(Modal)`
  height: 40rem;
  width: 100rem;
`;

const MapDiv = styled(MapContainer)`
  height: 40rem;
  width: 75rem;
  margin: 5rem 1rem 3rem 1rem;
`;

function UserLocationMap({ geolocation, setGeolocation }) {
  const map = useMap();

  useEffect(() => {
    map.locate().on('locationfound', function (e) {
      map.setView(e.latlng, map.getZoom());
      setGeolocation({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
      });
    });
  }, []);

  return (
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
  );
}

const PinDrop = ({ geolocation, setGeolocation }) => {
  const [position, setPosition] = useState([geolocation]);
  const map = useMap();
  const markerRef = useRef(null);

  const eventHandlers = () => ({
    click() {
      const marker = markerRef.current;
      if (marker != null) {
        setPosition(marker.getLatLng());
      }
    },
  });
  // map.mouseEventToLatLng('click', function (e) {
  //   setGeolocation({
  //     latitude: e.latlng.lat,
  //     longitude: e.latlng.lng,
  //   });
  // });
  return <Marker position={position} eventHandlers={eventHandlers} ref={markerRef} />;
};

export const MapModal = ({ onClose, geolocation, setGeolocation, mapModalOpen }: any) => {
  return (
    <GeolocateModal isOpen onClose={onClose}>
      <MapDiv center={[17.7134, 178.065]} zoom={12} scrollWheelZoom={true} zoomControl={false}>
        <UserLocationMap geolocation={geolocation} setGeolocation={setGeolocation} />
        <PinDrop geolocation={geolocation} setGeolocation={setGeolocation} />
        <ZoomControl position="bottomright" />
      </MapDiv>
    </GeolocateModal>
  );
};
