/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';

const Container = styled.div`
  display: flex;
  height: calc(100vh - 275px);
  min-height: 600px;
`;

const Main = styled.div`
  position: relative;
  flex: 1;
  height: 100%;
`;

export const MapView = () => (
  <Container>
    <Main>
      <Typography>Map View</Typography>
    </Main>
  </Container>
);
