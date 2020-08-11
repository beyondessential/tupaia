/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import MuiBox from '@material-ui/core/Box';
import { RouterProvider } from '../helpers/RouterProvider';
import { ProfileButton, ProfileButtonItem } from '../src';

export default {
  title: 'ProfileButton',
  decorators: [story => <RouterProvider>{story()}</RouterProvider>],
};

const Container = styled(MuiBox)`
  display: flex;
  justify-content: flex-end;
  max-width: 1200px;
  padding: 1rem;
`;

const exampleUser = {
  name: 'Catherine Bell',
  firstName: 'Catherine',
  email: 'catherine@beyondessential.com.au',
};

const ProfileLinks = () => (
  <>
    <ProfileButtonItem to="/profile">Edit Profile</ProfileButtonItem>
    <ProfileButtonItem to="/logout">Logout</ProfileButtonItem>
  </>
);

export const Simple = () => (
  <Container>
    <ProfileButton user={exampleUser} MenuOptions={ProfileLinks} />
  </Container>
);
