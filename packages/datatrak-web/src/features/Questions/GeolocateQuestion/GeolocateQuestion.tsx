/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { MapModal } from './MapModal';
import { LatLongFields } from './LatLongFields';
import { SurveyQuestionInputProps } from '../../../types';
import { FlexColumn } from '@tupaia/ui-components';

const Container = styled.div`
  display: flex;
  align-items: flex-end;
  margin-top: 1.4rem;
`;

const SeparatorText = styled(Typography)`
  font-size: 1rem;
  margin: 0.2rem 1.5rem;
`;

const defaultLocation = {
  latitude: null,
  longitude: null,
};

export const GeolocateQuestion = ({
  text,
  controllerProps: { value = defaultLocation, onChange, name },
}: SurveyQuestionInputProps) => {
  if (Number.isNaN(value.latitude) || Number.isNaN(value.longitude)) {
    value.latitude = value.latitude || null;
    value.longitude = value.longitude || null;
  }

  return (
    <FlexColumn>
      {text && <Typography>{text}</Typography>}
      <Container>
        <LatLongFields geolocation={value} setGeolocation={onChange} name={name} />
        <SeparatorText>or</SeparatorText>
        <MapModal geolocation={value} setGeolocation={onChange} defaultLocation={defaultLocation} />
      </Container>
    </FlexColumn>
  );
};
