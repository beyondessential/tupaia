/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { TextField, Button, UserMessage, CardTabPanel } from '@tupaia/ui-components';
import { FetchLoader } from './FetchLoader';
import * as COLORS from '../constants/colors';

const greySectionHeight = '225px';

const Container = styled.div`
  padding-bottom: ${greySectionHeight};
`;

const StyledUserMessage = styled(UserMessage)`
  margin-bottom: 2rem;
`;

const GreySection = styled.div`
  position: absolute;
  height: ${greySectionHeight};
  bottom: 0;
  width: 100%;
  background: ${COLORS.LIGHTGREY};
  padding: 25px 20px;
`;

export const NotesTab = ({ state }) => {
  const { data: messages } = state;

  const handleUpdate = () => {
    console.log('update');
  };

  const handleDelete = () => {
    console.log('delete');
  };

  return (
    <Container>
      <CardTabPanel>
        <FetchLoader state={state}>
          {messages.map(data => {
            const message = {
              ...data.message,
              dateTime: data.message.created,
            };
            return (
              <StyledUserMessage
                key={message.id}
                message={message}
                user={data.user}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            );
          })}
        </FetchLoader>
      </CardTabPanel>
      <GreySection>
        <TextField name="textArea" placeholder="Type in your notes..." multiline rows="4" />
        <Button fullWidth>Add Note</Button>
      </GreySection>
    </Container>
  );
};

NotesTab.propTypes = {
  state: PropTypes.object.isRequired,
};
