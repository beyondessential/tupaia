/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import { LatLngLiteral } from 'leaflet';
import { Typography } from '@material-ui/core';
import { OutlinedButton } from '@tupaia/ui-components';
import { Button, Modal } from '../../../../components';
import { Map } from './Map';

const Heading = styled(Typography).attrs({
  variant: 'h2',
})`
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const Container = styled.div`
  ${({ theme }) => theme.breakpoints.up('md')} {
    width: 80vw;
    max-width: 75rem;
    padding: 0 1.5rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 1.8rem;
  width: 100%;
`;
type Geolocation = {
  latitude?: LatLngLiteral['lat'];
  longitude?: LatLngLiteral['lng'];
};

export const MapModal = ({
  geolocation,
  setGeolocation,
  closeModal,
}: {
  geolocation: Geolocation;
  setGeolocation: (geolocation: Geolocation) => void;
  closeModal: () => void;
}) => {
  const [{ lat: currentLatitude, lng: currentLongitude }, setCoordinates] = useState({
    lat: geolocation?.latitude,
    lng: geolocation?.longitude,
  });

  const onSubmit = () => {
    // set geolocation to new coordinates
    setGeolocation({
      latitude: currentLatitude,
      longitude: currentLongitude,
    });
    closeModal();
  };

  return (
    <Modal open onClose={closeModal}>
      <Container>
        <Heading>Drop pin on map</Heading>
        <Typography color="textSecondary">
          Click to drop the pin in a new position on the map and click 'Confirm'
        </Typography>
        <Map lng={currentLongitude} lat={currentLatitude} setCoordinates={setCoordinates} />
        <ButtonGroup>
          <OutlinedButton onClick={closeModal}>Cancel</OutlinedButton>
          <Button onClick={onSubmit}>Confirm</Button>
        </ButtonGroup>
      </Container>
    </Modal>
  );
};
