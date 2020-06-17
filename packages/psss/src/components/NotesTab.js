/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { TextField, Button, CardTabPanel } from '@tupaia/ui-components';
import { UserMessage } from './UserMessage';
import * as COLORS from '../constants/colors';

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

const StyledUserMessage = styled(UserMessage)`
  margin-bottom: 2rem;
`;

const GreySection = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  background: ${COLORS.LIGHTGREY};
  padding: 25px 20px;
`;

export const NotesTab = () => {
  const handleUpdate = () => {
    console.log('update');
  };

  const handleDelete = () => {
    console.log('delete');
  };

  return (
    <div>
      <CardTabPanel>
        <StyledUserMessage
          message={message}
          user={user}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
        <StyledUserMessage
          message={message}
          user={user}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
        <StyledUserMessage
          message={message}
          user={user}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </CardTabPanel>
      <GreySection>
        <TextField name="textArea" placeholder="Type in your notes..." multiline rows="4" />
        <Button fullWidth>Add Note</Button>
      </GreySection>
    </div>
  );
};
