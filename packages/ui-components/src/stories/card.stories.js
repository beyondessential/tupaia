/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Card, CardHeader, CardFooter, CardContent } from '../components/Card';
import { Error } from '@material-ui/icons';
import Paper from '@material-ui/core/Paper';
import MuiBox from '@material-ui/core/Box';
import * as COLORS from '../theme/colors';
import Typography from '@material-ui/core/Typography';
import { Button } from '../components/Button';

export default {
  title: 'Card',
  component: Card,
};

const Container = styled(MuiBox)`
  max-width: 460px;
  padding: 3rem;
  background: ${COLORS.LIGHTGREY};

  .MuiCard-root {
    min-height: 120px;
    //max-width: 360px;
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

export const examples = () => (
  <Container>
    <Card variant="outlined" mb={3}>
      <CardContent>
        <Typography variant="h4" gutterBottom>
          Heading
        </Typography>
        <Typography variant="body2" gutterBottom>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur unde
          suscipit, quam beatae rerum inventore consectetur, neque doloribus, cupiditate numquam
          dignissimos laborum fugiat deleniti? Eum quasi quidem quibusdam.
        </Typography>
        <Typography variant="body2" gutterBottom>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur unde
          suscipit, quam beatae rerum inventore consectetur, neque doloribus, cupiditate numquam
          dignissimos laborum fugiat deleniti? Eum quasi quidem quibusdam.
        </Typography>
        <br />
        <Button>Submit</Button>
      </CardContent>
    </Card>
    <Card variant="outlined">
      <CardContent>
        <CardHeader>
          <Typography>Reports submitted</Typography>
          <Typography>W10</Typography>
        </CardHeader>
        <Typography variant="h3">11/22 Countries</Typography>
      </CardContent>
    </Card>
    <Card variant="outlined">
      <CardContent>
        <CardHeader>
          <Typography color="error">Submission due in 3 days</Typography>
          <Error color="error" />
        </CardHeader>
        <Typography variant="h4" gutterBottom>
          Week 11 Upcoming Report
        </Typography>
        <Typography variant="subtitle2" gutterBottom>
          Feb 25, 2020 - Mar 1, 2020
        </Typography>
        <br/>
        <Button fullWidth>Submit now</Button>
      </CardContent>
      <CardFooter>Sites reported: 22/30</CardFooter>
    </Card>
  </Container>
);
