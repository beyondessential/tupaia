/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { action } from '@storybook/addon-actions';
import { Button, LightOutlinedButton, ProfileButton } from '../components/Button';
import Box from '@material-ui/core/Box';
import * as COLORS from '../theme/colors';
import { SystemUpdateAlt } from '@material-ui/icons';
import Avatar from '@material-ui/core/Avatar';

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

export const LightOutlined = () => (
  <Box m={3}>
    <LightOutlinedButton
      endIcon={<SystemUpdateAlt />}
      onClick={action('Light Outlined button clicked')}
    >
      Outlined
    </LightOutlinedButton>
  </Box>
);

LightOutlined.story = {
  parameters: {
    backgrounds: [{ name: 'Header', value: COLORS.BLUE, default: true }],
  },
};

export const Profile = () => (
  <Box m={3}>
    <ProfileButton startIcon={<Avatar>T</Avatar>} onClick={action('Profile button clicked')}>
      Tom
    </ProfileButton>
  </Box>
);

Profile.story = {
  parameters: {
    backgrounds: [{ name: 'Header', value: COLORS.BLUE, default: true }],
  },
};
