/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { action } from '@storybook/addon-actions';
import { Button } from '../components/Button';
import Box from '@material-ui/core/Box';

export default {
  title: 'Button',
};

export const Default = () => (
  <>
    <Box m={3}>
      <Button m={4} onClick={action('Default button clicked')}>
        Default
      </Button>
    </Box>
    <Box m={3}>
      <Button isSubmitting>Default</Button>
    </Box>
  </>
);

export const Secondary = () => (
  <>
    <Box m={3}>
      <Button color="secondary" onClick={action('Secondary button clicked')}>
        Secondary
      </Button>
    </Box>
    <Box m={3}>
      <Button color="secondary" onClick={action('Secondary button clicked')} isSubmitting>
        Secondary
      </Button>
    </Box>
  </>
);

export const Outlined = () => (
  <>
    <Box m={3}>
      <Button variant="outlined" onClick={action('Outlined button clicked')}>
        Outlined
      </Button>
    </Box>
    <Box m={3}>
      <Button variant="outlined" isSubmitting>
        Outlined
      </Button>
    </Box>
  </>
);
