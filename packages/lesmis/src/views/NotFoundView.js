/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import { OutlinedButton } from '@tupaia/ui-components';
import Typography from '@material-ui/core/Typography';
import { Container } from '../components';

// Todo: Improve the layout of this view
// @see https://github.com/beyondessential/tupaia-backlog/issues/421
export const NotFoundView = () => (
  <Container>
    <br />
    <br />
    <Typography variant="h2" gutterBottom>
      The page you are looking for does not exist.
    </Typography>
    <br />
    <OutlinedButton component="a" href="/">
      Go back to home page
    </OutlinedButton>
  </Container>
);
