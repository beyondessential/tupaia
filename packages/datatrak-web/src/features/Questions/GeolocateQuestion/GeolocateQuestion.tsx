/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import MapIcon from '@material-ui/icons/Map';
import { MapModal } from './MapModal';
import { LatLongFields } from './LatLongFields';
import { SurveyQuestionInputProps } from '../../../types';
import { Button } from '../../../components';

const Container = styled.div`
  display: flex;
  align-items: flex-end;
  margin-top: 1.4rem;
`;

const Wrapper = styled.fieldset`
  margin: 0;
  border: none;
  padding: 0;
  legend {
    padding: 0;
  }
`;

const SeparatorText = styled(Typography)`
  font-size: 1rem;
  margin: 0.8rem 1.5rem 0.3rem;
`;

const ModalButton = styled(Button).attrs({
  variant: 'text',
})`
  padding-left: 0.1rem;
  padding-bottom: 0;
`;

const ButtonText = styled.span`
  text-decoration: underline;
  margin-left: 0.56rem;
  font-size: 1rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;

export const GeolocateQuestion = ({
  text,
  required,
  controllerProps: { value, onChange, name, invalid },
}: SurveyQuestionInputProps) => {
  const [mapModalOpen, setMapModalOpen] = useState(false);

  const toggleMapModal = () => {
    setMapModalOpen(!mapModalOpen);
  };
  return (
    <Wrapper>
      {text && <Typography component="legend">{text}</Typography>}
      <Container>
        <LatLongFields
          geolocation={value}
          setGeolocation={onChange}
          name={name}
          invalid={invalid}
          required={required}
        />
        <SeparatorText>or</SeparatorText>
        <ModalButton onClick={toggleMapModal}>
          <MapIcon />
          <ButtonText>Drop pin on map</ButtonText>
        </ModalButton>
        {mapModalOpen && (
          <MapModal geolocation={value} setGeolocation={onChange} closeModal={toggleMapModal} />
        )}
      </Container>
    </Wrapper>
  );
};
