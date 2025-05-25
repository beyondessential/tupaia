import { Typography } from '@material-ui/core';
import MapIcon from '@material-ui/icons/Map';
import LocationSearchingIcon from '@mui/icons-material/LocationSearching';
import React, { useState } from 'react';
import styled from 'styled-components';

import { useSurveyForm } from '../..';
import { Button, InputHelperText } from '../../../components';
// Implicit import from components/ causes ReferenceError (probably circular import)
import { OrDivider } from '../../../components/OrDivider';
import { SurveyQuestionInputProps } from '../../../types';
import { useIsMobile } from '../../../utils';
import { LatLongFields } from './LatLongFields';
import { MapModal } from './MapModal';

const Container = styled.div`
  display: flex;
  flex-direction: column-reverse;
  margin-top: 1.4rem;

  ${props => props.theme.breakpoints.up('md')} {
    column-gap: 1.125rem;
    flex-direction: row;
    margin-inline-start: 1.125rem;

    ${OrDivider} {
      display: unset;
      inline-size: unset;
      &::before,
      &::after {
        content: unset;
      }
    }
  }
`;

const Wrapper = styled.fieldset`
  legend {
    padding: 0;
  }
`;

const StyledButton = styled(Button)`
  ${props => props.theme.breakpoints.up('md')} {
    &.MuiButton-root {
      text-decoration: underline;
    }
  }
`;

export const GeolocateQuestion = ({
  text,
  required,
  detailLabel,
  controllerProps: { value, onChange, name, invalid },
}: SurveyQuestionInputProps) => {
  const { isReviewScreen, isResponseScreen } = useSurveyForm();
  const [mapModalOpen, setMapModalOpen] = useState(false);

  const isMobile = useIsMobile();
  const isOnline = window.navigator.onLine;

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
            <OrDivider />
            <StyledButton
              onClick={toggleMapModal}
              fullWidth={isMobile}
              variant={isMobile ? 'contained' : 'text'}
              startIcon={isOnline ? <MapIcon /> : <LocationSearchingIcon />}
            >
              {isOnline ? 'Drop pin on map' : 'Detect current location'}
            </StyledButton>
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
