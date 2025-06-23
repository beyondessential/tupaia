import React, { useState } from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import MapIcon from '@material-ui/icons/Map';
import { SurveyQuestionInputProps } from '../../../types';
import { Button, InputHelperText } from '../../../components';
import { useSurveyForm } from '../..';
import { MapModal } from './MapModal';
import { LatLongFields } from './LatLongFields';

const Container = styled.div`
  display: flex;
  align-items: flex-end;
  margin-top: 1.4rem;

  @media screen and (max-width: ${({ theme }) => theme.breakpoints.values.sm}px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

const Wrapper = styled.fieldset`
  legend {
    padding: 0;
  }
`;

const SeparatorText = styled(Typography)`
  font-size: 1rem;
  margin-block: 0.8rem 0.3rem;
  margin-inline: 1.5rem;
`;

const ModalButton = styled(Button).attrs({
  variant: 'text',
})`
  padding-block-end: 0;
  padding-inline-start: 0.1rem;
`;

const ButtonText = styled.span`
  font-size: 1rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  margin-inline-start: 0.56rem;
  text-decoration: underline;
`;

export const GeolocateQuestion = ({
  text,
  required,
  detailLabel,
  controllerProps: { value, onChange, name, invalid },
}: SurveyQuestionInputProps) => {
  const { isReviewScreen, isResponseScreen } = useSurveyForm();
  const [mapModalOpen, setMapModalOpen] = useState(false);

  const toggleMapModal = () => {
    setMapModalOpen(!mapModalOpen);
  };

  const displayMapModalButton = !isReviewScreen && !isResponseScreen;
  return (
    <Wrapper>
      {text && <Typography component="legend">{text}</Typography>}
      {detailLabel && <InputHelperText>{detailLabel}</InputHelperText>}
      <Container>
        <LatLongFields
          geolocation={value}
          setGeolocation={onChange}
          name={name}
          invalid={invalid}
          required={required}
        />

        {displayMapModalButton && (
          <>
            <SeparatorText>or</SeparatorText>
            <ModalButton onClick={toggleMapModal}>
              <MapIcon />
              <ButtonText>Drop pin on map</ButtonText>
            </ModalButton>
          </>
        )}
        <MapModal
          geolocation={value}
          setGeolocation={onChange}
          closeModal={toggleMapModal}
          mapModalOpen={mapModalOpen}
        />
      </Container>
    </Wrapper>
  );
};
