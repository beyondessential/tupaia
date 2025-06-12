import { Typography } from '@material-ui/core';
import MapIcon from '@material-ui/icons/Map';
import LocationSearchingIcon from '@mui/icons-material/LocationSearching';
import React, { useState } from 'react';
import styled from 'styled-components';

import { useCurrentPosition } from '@tupaia/ui-components';

import { useSurveyForm } from '../..';
import { Button, InputHelperText } from '../../../components';
// Implicit import from components/ causes ReferenceError (probably circular import)
import { OrDivider } from '../../../components/OrDivider';
import { SurveyQuestionInputProps } from '../../../types';
import { useIsMobile } from '../../../utils';
import { LatLongFields } from './LatLongFields';
import { MapModal } from './MapModal';

const geolocationPositionErrorMessages = {
  [GeolocationPositionError.PERMISSION_DENIED]:
    'To detect your location, please grant Tupaia DataTrak location access',
  [GeolocationPositionError.POSITION_UNAVAILABLE]:
    'Couldn’t detect your location. Try again when you have stronger GPS, cellular or Wi-Fi reception.',
  [GeolocationPositionError.TIMEOUT]:
    'Couldn’t determine your location within a reasonable time. Try again when you have stronger GPS, cellular or Wi-Fi reception.',
} as const;

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
  // LatLngFields is composed of two narrow inputs, but is semantically one field, so we manually
  // emulate normal helper text behaviour
  const [feedback, setFeedback] = useState<string | null>(null);

  const isMobile = useIsMobile();
  const isOnline = window.navigator.onLine;

  const toggleMapModal = () => {
    setMapModalOpen(!mapModalOpen);
  };

  const [position, error] = useCurrentPosition();

  const populateFromCurrentPosition = () => {
    if (error !== null) {
      setFeedback(geolocationPositionErrorMessages[error.code]);
      return;
    }

    if (position === null) {
      setFeedback(geolocationPositionErrorMessages[GeolocationPositionError.POSITION_UNAVAILABLE]);
      return;
    }

    setFeedback(null);
    const { latitude, longitude, accuracy } = position.coords;
    onChange({ latitude, longitude, accuracy });
  };

  const displayMapModalButton = !isReviewScreen && !isResponseScreen;
  return (
    <fieldset>
      {text && <Typography component="legend">{text}</Typography>}
      {detailLabel && <InputHelperText>{detailLabel}</InputHelperText>}
      <Container>
        <LatLongFields
          geolocation={value}
          setGeolocation={onChange}
          name={name}
          helperText={feedback}
          invalid={invalid}
          required={required}
        />

        {displayMapModalButton && (
          <>
            <OrDivider />
            <StyledButton
              onClick={isOnline ? toggleMapModal : populateFromCurrentPosition}
              fullWidth={isMobile}
              variant={isMobile ? 'contained' : 'text'}
              startIcon={isOnline ? <MapIcon /> : <LocationSearchingIcon />}
            >
              {isOnline ? 'Drop pin on map' : 'Detect current location'}
            </StyledButton>
          </>
        )}
        {isOnline && (
          <MapModal
            geolocation={value}
            setGeolocation={onChange}
            closeModal={toggleMapModal}
            mapModalOpen={mapModalOpen}
          />
        )}
      </Container>
    </fieldset>
  );
};
