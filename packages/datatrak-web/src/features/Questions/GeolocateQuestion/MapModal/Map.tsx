/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { LatLngLiteral } from 'leaflet';
import { MapContainer as BaseMapContainer, ZoomControl } from 'react-leaflet';
import { TilePicker } from '@tupaia/ui-map-components';
import {
  DEFAULT_BOUNDS,
  DEFAULT_ZOOM_LEVEL,
  UNSET_LOCATION_ZOOM_LEVEL,
  tileSets,
} from './constants';
import { UserLocationMap } from './UserLocationMap';
import { PinDrop } from './PinDrop';

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

const TilePickerWrapper = styled.div`
  position: absolute;
  z-index: 1000;
  right: 0;
  bottom: 0;
  height: 100%;
  .MuiButton-root {
    background-color: ${({ theme }) => theme.palette.background.paper};
    ${({ theme }) => theme.breakpoints.down('xs')} {
      margin-bottom: 1.5rem;
    }
  }
`;

interface MapProps {
  lat?: number;
  lng?: number;
  setCoordinates: (coordinates: LatLngLiteral) => void;
  onChangeTileSet: (tileSetKey: string) => void;
  tileSet: typeof tileSets.osm;
}

export const Map = ({ lat, lng, setCoordinates, tileSet, onChangeTileSet }: MapProps) => {
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
      attributionControl={false}
    >
      <UserLocationMap
        lat={lat}
        lng={lng}
        setCoordinates={onUpdateCoordinates}
        coordinatesInvalid={coordinatesInvalid}
        tileSet={tileSet}
      />
      <TilePickerWrapper>
        <TilePicker
          tileSets={[tileSets.osm, tileSets.satellite]}
          activeTileSet={tileSet}
          onChange={onChangeTileSet}
        />
      </TilePickerWrapper>

      {!coordinatesInvalid && <PinDrop lat={lat} lng={lng} setCoordinates={onUpdateCoordinates} />}
      <ZoomControl position="topright" />
    </MapContainer>
  );
};
