/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { Map } from '@material-ui/icons';
import { FlexColumn } from '@tupaia/ui-components';
import { MapModal, LatLongFields } from './geolocateComponents';
import { SurveyQuestionInputProps } from '../../types';

const MainWrapper = styled(FlexColumn)``;

const LatLongWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: -1.4rem;
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

const defaultLocation = {
  latitude: null,
  longitude: null,
};

export const GeolocateQuestion = ({
  text,
  controllerProps: { value = defaultLocation, onChange },
}: SurveyQuestionInputProps) => {
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const toggleMapModal = () => {
    setMapModalOpen(!mapModalOpen);
  };
  if (Number.isNaN(value.latitude) || Number.isNaN(value.longitude)) {
    value.latitude = value.latitude || null;
    value.longitude = value.longitude || null;
  }

  return (
    <>
      {mapModalOpen && (
        <MapModal
          onClose={toggleMapModal}
          geolocation={value}
          setGeolocation={onChange}
          defaultLocation={defaultLocation}
        />
      )}
      <MainWrapper>
        {text && <Typography>{text}</Typography>}
        <LatLongWrapper>
          <LatLongFields geolocation={value} setGeolocation={onChange} />
          <SeparatorText>or</SeparatorText>
          <MapLinkWrapper onClick={toggleMapModal}>
            <MapIcon />
            <MapLinkText>Drop pin on map</MapLinkText>
          </MapLinkWrapper>
        </LatLongWrapper>
      </MainWrapper>
    </>
  );
};
