import React from 'react';
import { Icon, LatLngLiteral } from 'leaflet';
import { Marker, useMapEvents } from 'react-leaflet';

const Pin = new Icon({
  iconUrl: '/mapIcon.png',
  iconSize: [70, 70],
  iconAnchor: [35, 60], // anchor the tip of the pin to the coordinates
});

interface PinDropProps {
  lat?: number;
  lng?: number;
  setCoordinates: (coordinates: LatLngLiteral) => void;
}

export const PinDrop = ({ lat, lng, setCoordinates }: PinDropProps) => {
  useMapEvents({
    click(e) {
      setCoordinates(e.latlng);
    },
  });

  return <Marker position={[lat!, lng!]} icon={Pin} />;
};
