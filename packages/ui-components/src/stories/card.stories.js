/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import Card from '@material-ui/core/Card';
import Paper from '@material-ui/core/Paper';
import MuiBox from '@material-ui/core/Box';
import * as COLORS from '../theme/colors';

export default {
  title: 'Card',
  component: Card,
};

const Container = styled(MuiBox)`
  max-width: 1200px;
  padding: 5rem;
  background: ${COLORS.LIGHTGREY}; 
  
  div {
    height: 330px;
    max-width: 360px;
  }
`;

// Paper is the basis for card
export const paper = () => (
  <Container>
    <Paper />
  </Container>
);

export const border = () => (
  <Container>
    <Card variant="outlined" />
  </Container>
);

export const withoutBorder = () => (
  <Container>
    <Card elevation={0} />
  </Container>
);

export const shadow = () => (
  <Container>
    <Card />
  </Container>
);