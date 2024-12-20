/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { HEADER_HEIGHT } from '../constants';
import { GeolocateQuestion } from '../features/Questions';

const PageWrapper = styled.div`
  display: flex;
  padding: 3rem;
  flex-direction: column;
  background: ${({ theme }) => theme.palette.background.default};
  min-height: 100vh;
  + .notistack-SnackbarContainer {
    top: calc(1rem + ${HEADER_HEIGHT});
  }
`;

export const MainPageLayout = () => {
  const [geolocation, setGeolocation] = React.useState(null);
  const handleChange = value => {
    console.log('value', value);
    setGeolocation(value);
  };
  const controllerProps = {
    name: 'geolocation',
    value: geolocation,
    onChange: handleChange,
  };

  return (
    <PageWrapper>
      <GeolocateQuestion
        id="geolocation"
        name="geolocation"
        text="geolocation"
        controllerProps={controllerProps}
      />
    </PageWrapper>
  );
};
