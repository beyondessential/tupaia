/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

export const ABOUT_PAGE = {
  title: 'About LESMIS',
  urlSegment: 'about',
  body: (
    <>
      <Typography variant="h1" gutterBottom>
        About LESMIS
      </Typography>
      <Typography>
        LESMIS is a system to improve data quality, management and utilisation for the Ministry of
        Education and Sports.
      </Typography>
    </>
  ),
};

export const CONTACT_PAGE = {
  title: 'Contact Us',
  urlSegment: 'contact',
  body: (
    <>
      <Typography variant="h1" gutterBottom>
        Contact Us
      </Typography>
      <Box mb={5}>
        <Typography variant="h2">Phone</Typography>
        <Typography>+856 20 54 015 004</Typography>
      </Box>
      <Box mb={5}>
        <Typography variant="h2">Website</Typography>
        <Typography>www.moes.edu.la</Typography>
      </Box>
    </>
  ),
};
