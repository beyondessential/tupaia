import { Typography } from '@material-ui/core';
import React, { useState } from 'react';
import styled from 'styled-components';

import { OutlinedButton } from '@tupaia/ui-components';
import { DEFAULT_TILESETS, getAutoTileSet } from '@tupaia/ui-map-components';

import { Button, Modal } from '../../../../components';
import { Map } from './Map';

const Heading = styled(Typography).attrs({
  variant: 'h2',
})`
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const Container = styled.div`
  inline-size: 80dvi;
  max-inline-size: 100%;
  ${({ theme }) => theme.breakpoints.down('sm')} {
    margin-block-start: -1rem;
  }

  ${({ theme }) => theme.breakpoints.up('md')} {
    max-inline-size: 75rem;
    padding-inline: 1.5rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-block-start: 1.8rem;
  inline-size: 100%;
`;

type Geolocation = Partial<Pick<GeolocationCoordinates, 'latitude' | 'longitude' | 'accuracy'>>;

interface MapModalProps {
  geolocation: Geolocation;
  setGeolocation: (geolocation: Geolocation) => void;
  closeModal: () => void;
  mapModalOpen: boolean;
}

export const MapModal = ({
  geolocation,
  setGeolocation,
  closeModal,
  mapModalOpen,
}: MapModalProps) => {
  const initialTileSet = getAutoTileSet();
  // set this in this component instead of in the Map component so that the selected tileset remains if the modal is closed and reopened without changing pages
  const [selectedTileSet, setSelectedTileSet] = useState(initialTileSet);
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

  const handleChangeTileSet = tileSetKey => {
    setSelectedTileSet(DEFAULT_TILESETS[tileSetKey]);
  };

  return (
    <Modal open={mapModalOpen} onClose={closeModal}>
      <Container>
        <Heading>Drop pin on map</Heading>
        <Typography color="textSecondary">
          Click to drop the pin in a new position on the map and click &lsquo;Confirm&rsquo;
        </Typography>
        <Map
          lng={currentLongitude}
          lat={currentLatitude}
          setCoordinates={setCoordinates}
          tileSet={selectedTileSet}
          onChangeTileSet={handleChangeTileSet}
        />
        <ButtonGroup>
          <OutlinedButton onClick={closeModal}>Cancel</OutlinedButton>
          <Button onClick={onSubmit}>Confirm</Button>
        </ButtonGroup>
      </Container>
    </Modal>
  );
};
