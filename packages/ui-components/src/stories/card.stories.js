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
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { Button } from '../components/Button';

export default {
  title: 'Card',
  component: Card,
};

const Container = styled(MuiBox)`
  max-width: 1200px;
  width: 100vw;
  height: 100vh;
  padding: 3rem;
  background: ${COLORS.LIGHTGREY}; 
  
  div {
    min-height: 300px;
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

export const example = () => (
  <Container>
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h4" gutterBottom>
          Heading
        </Typography>
        <Typography variant="body2" gutterBottom>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur
          unde suscipit, quam beatae rerum inventore consectetur, neque doloribus, cupiditate
          numquam dignissimos laborum fugiat deleniti? Eum quasi quidem quibusdam.
        </Typography>
        <Typography variant="body2" gutterBottom>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur
          unde suscipit, quam beatae rerum inventore consectetur, neque doloribus, cupiditate
          numquam dignissimos laborum fugiat deleniti? Eum quasi quidem quibusdam.
        </Typography>
        <br/>
        <Button>Submit</Button>
      </CardContent>
    </Card>
  </Container>
);