/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import MuiBox from '@material-ui/core/Box';
import { ProfileButton, ProfileButtonItem } from '../src/components';

const Container = styled(MuiBox)`
  display: flex;
  justify-content: flex-end;
  max-width: 1200px;
  padding: 1rem;
`;

export default {
  title: 'ProfileButton',
  component: ProfileButton,
  decorators: [
    Story => (
      <Container>
        <Story />
      </Container>
    ),
  ],
};

const exampleUser = {
  name: 'Catherine Bell',
  firstName: 'Catherine',
  email: 'catherine@beyondessential.com.au',
};

const ProfileLinks = () => (
  <>
    <ProfileButtonItem to="/profile">Edit Profile</ProfileButtonItem>
    <ProfileButtonItem
      button
      onClick={() => {
        console.log('button click...');
      }}
    >
      Logout
    </ProfileButtonItem>
  </>
);

const Template = args => <ProfileButton {...args} />;
export const Simple = Template.bind({});
Simple.args = {
  user: exampleUser,
  MenuOptions: ProfileLinks,
};
