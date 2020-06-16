/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import MuiAlert from '@material-ui/lab/Alert';
import { UserMessage } from '../src';

export default {
  title: 'UserMessage',
};

const Container = styled.div`
  padding: 1rem;
  max-width: 480px;
`;

const StyledAlert = styled(MuiAlert)`
  margin: 1rem;
`;

const user = {
  avatarUrl: 'https://www.gravatar.com/avatar/03d39b671d0f4fd5b3dcb28bf4676760',
  title: 'Dr. Sarah De Jones',
};

const message = {
  content:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit Aliquam id enim id lorem porta rhoncus',
  id: 'user-message-123',
  dateTime: new Date(),
};

export const userMassage = () => {
  const [alertMessage, setAlertMessage] = React.useState(null);
  return (
    <Container>
      {alertMessage && <StyledAlert severity="info">{alertMessage}</StyledAlert>}
      <UserMessage
        message={message}
        user={user}
        onUpdate={id => setAlertMessage(`Updating ${id}...`)}
        onDelete={id => setAlertMessage(`Deleting ${id}...`)}
      />
    </Container>
  );
};
