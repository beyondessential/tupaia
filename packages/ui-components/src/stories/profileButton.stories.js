/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import styled from 'styled-components';
import MuiBox from '@material-ui/core/Box';
import { ProfileButton, LightProfileButton } from '../components/ProfileButton';
import * as COLORS from '../theme/colors';
import { RouterProvider } from '../RouterProvider';

export default {
  title: 'ProfileButton',
  decorators: [story => <RouterProvider>{story()}</RouterProvider>],
};

const Container = styled(MuiBox)`
  max-width: 1200px;
  padding: 1rem;
`;

export const profileButton = () => (
  <Container>
    <ProfileButton startIcon={<Avatar>T</Avatar>}>Tom</ProfileButton>
  </Container>
);

export const lightProfileButton = () => (
  <Container bgcolor={COLORS.BLUE}>
    <LightProfileButton startIcon={<Avatar>T</Avatar>}>Tom</LightProfileButton>
  </Container>
);
