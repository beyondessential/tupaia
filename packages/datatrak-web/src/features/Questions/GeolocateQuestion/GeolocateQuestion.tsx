import { FormHelperText, FormLabel } from '@material-ui/core';
import { Locate as LocateIcon, Map as MapIcon } from 'lucide-react';
import React, { useState } from 'react';
import styled from 'styled-components';

import { GEOLOCATION_UNSUPPORTED_ERROR, useCurrentPosition } from '@tupaia/ui-components';

import { useSurveyForm } from '../..';
import { Button, InputHelperText } from '../../../components';
// Implicit import from components/ causes ReferenceError (probably circular import)
import { OrDivider } from '../../../components/OrDivider';
import { SurveyQuestionInputProps } from '../../../types';
import { useIsMobile } from '../../../utils';
import { GeolocationAccuracyFeedback } from './GeolocationAccuracyFeedback';
import { LatLongFields } from './LatLongFields';
import { MapModal } from './MapModal';

/**
 * @privateRemarks A bit of a hack to avoid {@link ReferenceError} when
 * {@link GeolocationPositionError} isn’t available, most pertinently in the JSDOM test environment.
 * Resultant object is always identical. (Proper solution would define the interface in
 * [`setupFiles`](https://jestjs.io/docs/configuration#setupfiles-array) or
 * [`setupFilesAfterEnv`](https://jestjs.io/docs/configuration#setupfilesafterenv-array).)
 */
const EnvAgnosticGeolocationPositionError =
  'geolocation' in navigator
    ? ({
        PERMISSION_DENIED: GeolocationPositionError.PERMISSION_DENIED,
        POSITION_UNAVAILABLE: GeolocationPositionError.POSITION_UNAVAILABLE,
        TIMEOUT: GeolocationPositionError.TIMEOUT,
      } as const)
    : ({
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      } as const);

const errorMessages = {
  [GEOLOCATION_UNSUPPORTED_ERROR.code]: GEOLOCATION_UNSUPPORTED_ERROR.message,
  [EnvAgnosticGeolocationPositionError.PERMISSION_DENIED]:
    'Please allow Tupaia DataTrak to access your location. You may need to check your browser or system settings.',
  [EnvAgnosticGeolocationPositionError.POSITION_UNAVAILABLE]:
    'Couldn’t detect your location. Try again when you have stronger GPS, cellular or Wi-Fi reception.',
  [EnvAgnosticGeolocationPositionError.TIMEOUT]:
    'Couldn’t determine your location within a reasonable time. Try again when you have stronger GPS, cellular or Wi-Fi reception.',
} as const;

const Container = styled.div`
  display: flex;
  flex-direction: column-reverse;
  margin-block-start: 1.4rem;

  ${props => props.theme.breakpoints.up('md')} {
    column-gap: 1.125rem;
    flex-direction: row;

    ${OrDivider} {
      display: unset;
      inline-size: unset;
      margin-inline-start: 1.2rem;
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
  const toggleMapModal = () => setMapModalOpen(!mapModalOpen);

  // GeolocateQuestion is semantically one field; manually emulate normal helper text behaviour
  const [errorFeedback, setErrorFeedback] = useState<React.ReactNode | null>(null);
  const isMobile = useIsMobile();

  // This may in future be worth extracting into a `useIsOnline` hook. For now, it’s reasonable to
  // only get this status when this component is rendered due to some other trigger; no need to
  // cause a re-render when `online` or `offline` event fires between renders.
  const shouldUseDetectPosition = !window.navigator.onLine && 'geolocation' in navigator;

  const [position, error] = useCurrentPosition({ enabled: shouldUseDetectPosition });

  const populateFromCurrentPosition = () => {
    if (error !== null) {
      setErrorFeedback(errorMessages[error.code]);
      return;
    }

    if (position === null) {
      // `position` and `error` shouldn’t both be null, so this will probably never happen
      setErrorFeedback(errorMessages[EnvAgnosticGeolocationPositionError.POSITION_UNAVAILABLE]);
      return;
    }

    setErrorFeedback(null);
    const { latitude, longitude, accuracy } = position.coords;

    // Round, preserving approx. 1.11 metres’ precision
    onChange({
      latitude: latitude.toFixed(5),
      longitude: longitude.toFixed(5),
      accuracy,
    });
  };

  const isReadOnly = isReviewScreen || isResponseScreen;

  return (
    <fieldset>
      {text && (
        <FormLabel component="legend" error={invalid} required={required}>
          {text}
        </FormLabel>
      )}
      {detailLabel && <InputHelperText>{detailLabel}</InputHelperText>}
      <Container>
        <LatLongFields
          geolocation={value}
          setGeolocation={onChange}
          name={name}
          invalid={invalid}
          required={required}
        />

        {!isReadOnly && (
          <>
            <OrDivider />
            <StyledButton
              onClick={shouldUseDetectPosition ? populateFromCurrentPosition : toggleMapModal}
              fullWidth={isMobile}
              variant={isMobile ? 'contained' : 'text'}
              startIcon={shouldUseDetectPosition ? <LocateIcon /> : <MapIcon />}
            >
              {shouldUseDetectPosition ? 'Detect current location' : 'Drop pin on map'}
            </StyledButton>
          </>
        )}

        {!shouldUseDetectPosition && (
          <MapModal
            geolocation={value}
            setGeolocation={onChange}
            closeModal={toggleMapModal}
            mapModalOpen={mapModalOpen}
          />
        )}
      </Container>

      {typeof value?.accuracy === 'number' && (
        <GeolocationAccuracyFeedback accuracy={value.accuracy} quiet={isReadOnly} />
      )}
      {errorFeedback && <FormHelperText error>{errorFeedback}</FormHelperText>}
    </fieldset>
  );
};
