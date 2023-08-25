/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { LatLongFields } from './geolocateComponents';
import { Map } from '@material-ui/icons';
import { MapModal } from './geolocateComponents';
import { TextField } from '@tupaia/ui-components';

const QuestionInstruction = styled(Typography)`
  font-size: 1.3rem;
  font-weight: 500;
`;

const LatLongWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const Text = styled.div`
  margin-bottom: 0.625rem;
`;

const SeparatorText = styled(Text)`
  font-size: 1rem;
  margin: 2rem 2rem 1rem 0;
`;

const MapIcon = styled(Map)`
  margin-top: 1rem;
  color: blue;
  font-size: 1.2rem;
`;

const MapLinkText = styled(Text)`
  color: blue;
  text-decoration: underline;
  margin: 1rem 0.2rem;
  margin-top: 2.2rem;
  font-size: 1rem;
  font-weight: 500;
`;

const MapLinkWrapper = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

// Todo: Replace with actual database requests
const placeHolder = <Text>Question instructions</Text>;

const defaultLocation = {
  latitude: '',
  longitude: '',
  accuracy: '',
};
export const GeolocateQuestion = () => {
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [geolocation, setGeolocation] = useState(defaultLocation);
  const toggleMapModal = () => {
    setMapModalOpen(!mapModalOpen);
  };
  const answer = {
    latitude: parseFloat(geolocation.latitude),
    longitude: parseFloat(geolocation.longitude),
    accuracy: parseFloat(geolocation.accuracy),
  };

  return (
    <>
      {mapModalOpen && (
        <MapModal
          onClose={toggleMapModal}
          geolocation={geolocation}
          setGeolocation={setGeolocation}
          mapModalOpen={mapModalOpen}
        />
      )}
      <QuestionInstruction>{placeHolder}</QuestionInstruction>
      <LatLongWrapper>
        <TextField value={answer} type="hidden" />
        <LatLongFields geolocation={geolocation} setGeolocation={setGeolocation} />
        <SeparatorText>or</SeparatorText>
        <MapLinkWrapper onClick={toggleMapModal}>
          <MapIcon />
          <MapLinkText>Drop pin on map</MapLinkText>
        </MapLinkWrapper>
      </LatLongWrapper>
    </>
  );
};
