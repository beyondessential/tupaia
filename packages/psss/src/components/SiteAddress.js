/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import * as COLORS from '../theme/colors';

const Container = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: stretch;
`;

const AddressContainer = styled.div`
  display: block;
`;

const Map = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #efefef;
`;

export const SiteAddress = () => {
  return (
    <Container>
      <AddressContainer>
        <Typography></Typography>
      </AddressContainer>
      <Map>Map</Map>
    </Container>
  );
};
