/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import MuiBox from '@material-ui/core/Box';
import { UserMessage } from '../src';

export default {
  title: 'UserMessage',
};

const AVATAR_URL = 'https://www.gravatar.com/avatar/03d39b671d0f4fd5b3dcb28bf4676760';

const Container = styled(MuiBox)`
  padding: 1rem;
`;

export const WithAvatar = () => (
  <Container>
    <UserMessage
      id="userMessage1"
      avatarUrl={AVATAR_URL}
      title="Dr. Sarah De Jones"
      timestamp={new Date()}
      message="
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Aliquam id enim id lorem porta rhoncus.
      "
      onUpdate={() => console.log('userMessage1.onUpdate')}
      onDelete={() => console.log('userMessage1.onDelete')}
    />
  </Container>
);

export const WithoutAvatar = () => (
  <Container>
    <UserMessage
      id="userMessage2"
      title="Dr. Sarah De Jones"
      timestamp={new Date()}
      message="
        In pharetra libero et dapibus vehicula. Quisque ultricies nisi eget erat vulputate commodo.
        Nullam egestas dui vel augue convallis, vel ullamcorper mi euismod.
        Quisque non pulvinar turpis. Vestibulum pulvinar neque vel dignissim pretium.
        Fusce eget lacinia neque, at condimentum mauris.
      "
      onUpdate={() => console.log('userMessage2.onUpdate')}
      onDelete={() => console.log('userMessage2.onDelete')}
    />
  </Container>
);
