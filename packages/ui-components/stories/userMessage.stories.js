/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import Alert from '@material-ui/lab/Alert';
import MuiBox from '@material-ui/core/Box';
import { UserMessage } from '../src';

export default {
  title: 'UserMessage',
};

const AVATAR_URL = 'https://www.gravatar.com/avatar/03d39b671d0f4fd5b3dcb28bf4676760';

const Container = styled(MuiBox)`
  padding: 1rem;
`;

const StyledAlert = styled(Alert)`
  margin: 1rem;
`;

export const WithAvatar = () => {
  const [alertMessage, setAlertMessage] = React.useState(null);

  return (
    <Container>
      {alertMessage ? <StyledAlert severity="info">{alertMessage}</StyledAlert> : ''}

      <UserMessage
        id="user-message-123"
        avatarUrl={AVATAR_URL}
        title="Dr. Sarah De Jones"
        dateTime={new Date()}
        message="Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Aliquam id enim id lorem porta rhoncus."
        onUpdate={id => setAlertMessage(`Updating ${id}...`)}
        onDelete={id => setAlertMessage(`Deleting ${id}...`)}
      />
    </Container>
  );
};

export const WithoutAvatar = () => {
  const [alertMessage, setAlertMessage] = React.useState(null);

  return (
    <Container>
      {alertMessage ? <StyledAlert severity="info">{alertMessage}</StyledAlert> : ''}

      <UserMessage
        id="user-message-456"
        title="Dr. Sarah De Jones"
        dateTime={new Date()}
        message="In pharetra libero et dapibus vehicula. Quisque ultricies nisi eget erat vulputate commodo.
        Nullam egestas dui vel augue convallis, vel ullamcorper mi euismod.
        Quisque non pulvinar turpis. Vestibulum pulvinar neque vel dignissim pretium.
        Fusce eget lacinia neque, at condimentum mauris."
        onUpdate={id => setAlertMessage(`Updating ${id}...`)}
        onDelete={id => setAlertMessage(`Deleting ${id}...`)}
      />
    </Container>
  );
};
